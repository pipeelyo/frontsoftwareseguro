import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const userId = req.headers.get('x-user-id');
  const userRole = req.headers.get('x-user-role');

  if (!userId || (userRole !== 'ADMINISTRATIVO' && userRole !== 'ADMIN')) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  try {
    await dbConnect();

    const document = await Document.findById(context.params.id);

    if (!document) {
      return NextResponse.json({ error: 'Documento no encontrado.' }, { status: 404 });
    }

    logAuditEvent({
      userId,
      action: 'DOCUMENT_DOWNLOAD',
      details: { documentId: document._id, filename: document.filename },
      ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
    });

    // Return the file content for download
    return new NextResponse(document.data, {
      status: 200,
      headers: {
        'Content-Type': document.contentType,
        'Content-Disposition': `attachment; filename="${document.filename}"`,
      },
    });

  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
