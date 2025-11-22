import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Shift from '@/models/Shift';
import User from '@/models/User'; // Ensure User model is registered
import { UserRole } from '@/models/User';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const userRole = req.headers.get('x-user-role');

  if (!userId || (userRole !== 'SUPERVISOR' && userRole !== 'ADMIN')) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  try {
    await dbConnect();

    // Supervisors can see all shifts, populated with user info
    const shifts = await Shift.find({}).populate('userId', 'name email');

    return NextResponse.json(shifts);

  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
