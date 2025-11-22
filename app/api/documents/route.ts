import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  // If an ID is provided, handle single document download
  if (id) {
    const userId = req.headers.get('x-user-id');
    const userRole = req.headers.get('x-user-role');

    if (!userId || (userRole !== 'ADMINISTRATIVO' && userRole !== 'ADMIN')) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    }

    try {
      await dbConnect();
      const document = await Document.findById(id);

      if (!document) {
        return NextResponse.json({ error: 'Documento no encontrado.' }, { status: 404 });
      }

      logAuditEvent({
        userId,
        action: 'DOCUMENT_DOWNLOAD',
        details: { documentId: document._id, filename: document.filename },
        ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
      });

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

  // Original logic to get all documents
  const userRole = req.headers.get('x-user-role');

  // Allow ADMIN or ADMINISTRATIVO to view the list of documents
  if (userRole !== 'ADMINISTRATIVO' && userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  try {
    await dbConnect();

    // Fetch all documents, but exclude the large 'data' field
    const documents = await Document.find({}).select('-data').populate('uploadedBy', 'name');

    return NextResponse.json(documents);

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
