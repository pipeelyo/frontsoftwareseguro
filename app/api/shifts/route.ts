import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Shift from '@/models/Shift';
import User from '@/models/User'; // Ensure User model is registered
import { UserRole } from '@/models/User';

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('x-user-id')?.value;
  const userRole = req.cookies.get('x-user-role')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  try {
    await dbConnect();

    let shifts;
    if (userRole === 'ADMIN' || userRole === 'SUPERVISOR') {
      // Admins and Supervisors can see all shifts, populated with user info
      shifts = await Shift.find({}).populate('userId', 'name email').sort({ startTime: -1 });
    } else {
      // Other users can only see their own shifts
      shifts = await Shift.find({ userId }).sort({ startTime: -1 });
    }

    return NextResponse.json(shifts);

  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
