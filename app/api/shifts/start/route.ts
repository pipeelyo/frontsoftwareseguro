import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Shift from '@/models/Shift';
import { UserRole } from '@/models/User';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const userRole = req.headers.get('x-user-role');

  if (!userId || (userRole !== 'VIGILANTE' && userRole !== 'ADMIN')) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  try {
    await dbConnect();

    // Check if there is already an active shift for this user
    const activeShift = await Shift.findOne({ userId, status: 'ACTIVE' });
    if (activeShift) {
      return NextResponse.json({ error: 'Ya tienes un turno activo.' }, { status: 409 });
    }

    const { location } = await req.json(); // { lat, lon }

    const newShift = new Shift({
      userId,
      startTime: new Date(),
      startLocation: location,
      status: 'ACTIVE',
    });

    await newShift.save();

    logAuditEvent({
      userId,
      action: 'SHIFT_START',
      details: { shiftId: newShift._id, location },
      ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
    });

    return NextResponse.json(newShift, { status: 201 });

  } catch (error) {
    console.error('Error starting shift:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
