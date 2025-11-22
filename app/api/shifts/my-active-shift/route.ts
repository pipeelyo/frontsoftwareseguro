import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Shift from '@/models/Shift';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  try {
    await dbConnect();

    const activeShift = await Shift.findOne({ userId, status: 'ACTIVE' });

    if (!activeShift) {
      return NextResponse.json(null, { status: 200 }); // No active shift found, which is not an error
    }

    return NextResponse.json(activeShift);

  } catch (error) {
    console.error('Error fetching active shift:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
