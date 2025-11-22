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

    const activeShift = await Shift.findOne({ userId, status: 'ACTIVE' });
    if (!activeShift) {
      return NextResponse.json({ error: 'No tienes un turno activo para finalizar.' }, { status: 404 });
    }

    const { location } = await req.json(); // { lat, lon }

    activeShift.endTime = new Date();
    activeShift.endLocation = location;
    activeShift.status = 'COMPLETED';

    await activeShift.save();

    logAuditEvent({
      userId,
      action: 'SHIFT_END',
      details: { shiftId: activeShift._id, location },
      ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
    });

    return NextResponse.json(activeShift);

  } catch (error) {
    console.error('Error ending shift:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
