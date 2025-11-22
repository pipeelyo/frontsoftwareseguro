import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';

export async function GET(req: NextRequest) {
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
