import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Shift from '@/models/Shift';
import Incident from '@/models/Incident';
import User from '@/models/User'; // Ensure User model is registered
import { UserRole } from '@/models/User';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const userRole = req.headers.get('x-user-role');
  const { searchParams } = new URL(req.url);
  const shiftId = searchParams.get('shiftId');

  if (userRole !== 'SUPERVISOR' && userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  if (!shiftId) {
    return NextResponse.json({ error: 'El ID del turno es obligatorio.' }, { status: 400 });
  }

  try {
    await dbConnect();
    const incidents = await Incident.find({ shiftId });
    return NextResponse.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const userRole = req.headers.get('x-user-role');

  if (!userId || (userRole !== 'VIGILANTE' && userRole !== 'ADMIN')) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  try {
    await dbConnect();

    const { description, location, shiftId } = await req.json();

    if (!shiftId) {
      return NextResponse.json({ error: 'El ID del turno es obligatorio.' }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: 'La descripción es obligatoria.' }, { status: 400 });
    }

    const newIncident = new Incident({
      shiftId,
      userId,
      description,
      location,
      timestamp: new Date(),
    });

    await newIncident.save();

    logAuditEvent({
      userId,
      action: 'INCIDENT_REPORT',
      details: { shiftId, incidentId: newIncident._id, description },
      ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
    });

    return NextResponse.json(newIncident, { status: 201 });

  } catch (error) {
    console.error('Error creating incident:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
