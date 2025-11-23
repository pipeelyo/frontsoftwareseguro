import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Incident from '@/models/Incident';
import { logAuditEvent } from '@/lib/audit';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const adminId = req.cookies.get('x-user-id')?.value;
  const adminRole = req.cookies.get('x-user-role')?.value;

  if (!adminId || (adminRole !== 'ADMIN' && adminRole !== 'SUPERVISOR')) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: 'La descripción es obligatoria.' }, { status: 400 });
    }

    await dbConnect();

    const incident = await Incident.findById(params.id);
    if (!incident) {
      return NextResponse.json({ error: 'Novedad no encontrada.' }, { status: 404 });
    }

    const originalIncident = { ...incident.toObject() };

    incident.description = description;

    const updatedIncident = await incident.save();

    logAuditEvent({
      userId: adminId,
      action: 'INCIDENT_UPDATE_ADMIN',
      details: { 
        incidentId: updatedIncident._id,
        updatedBy: adminId,
        original: originalIncident,
        updated: updatedIncident.toObject(),
      },
      ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
    });

    return NextResponse.json(updatedIncident);

  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
