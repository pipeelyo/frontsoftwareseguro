import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import { logAuditEvent } from '@/lib/audit';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const userRole = req.headers.get('x-user-role');

  if (!userId || (userRole !== 'ADMINISTRATIVO' && userRole !== 'ADMIN')) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  try {
    const { filename, contentType, data: base64Data } = await req.json();

    if (!filename || !contentType || !base64Data) {
      return NextResponse.json({ error: 'Faltan datos del archivo.' }, { status: 400 });
    }

    const data = Buffer.from(base64Data, 'base64');

    // Generate hash
    const hash = crypto.createHash('sha256').update(data).digest('hex');

    await dbConnect();

    // Handle versioning
    const latestVersion = await Document.findOne({ filename }).sort({ version: -1 });

    let newVersion = 1;
    let originalDocumentId = null;

    if (latestVersion) {
      // If a document with the same name exists, this is a new version
      if (latestVersion.hash === hash) {
        return NextResponse.json({ error: 'Esta versión exacta del archivo ya existe.' }, { status: 409 });
      }
      newVersion = latestVersion.version + 1;
      originalDocumentId = latestVersion.originalDocumentId || latestVersion._id;
    }

    const newDocument = new Document({
      filename,
      contentType,
      data,
      hash,
      uploadedBy: userId,
      version: newVersion,
      originalDocumentId,
    });

    if (!originalDocumentId) {
      // If this is the very first version, it points to itself
      newDocument.originalDocumentId = newDocument._id;
    }

    await newDocument.save();

    logAuditEvent({
      userId,
      action: 'DOCUMENT_UPLOAD',
      details: { documentId: newDocument._id, filename, hash },
      ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
    });

    return NextResponse.json({ message: 'Documento subido con éxito.', documentId: newDocument._id }, { status: 201 });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
