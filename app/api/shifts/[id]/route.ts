import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Shift from '@/models/Shift';
import Incident from '@/models/Incident';
import { logAuditEvent } from '@/lib/audit';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const adminId = req.cookies.get('x-user-id')?.value;
  const adminRole = req.cookies.get('x-user-role')?.value;

  if (!adminId || adminRole !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  try {
    const { startTime, endTime, incidents } = await req.json();

    await dbConnect();

    const shift = await Shift.findById(id);
    if (!shift) {
      return NextResponse.json({ error: 'Turno no encontrado.' }, { status: 404 });
    }

    const originalShift = { ...shift.toObject() };

    // Update fields
    shift.startTime = startTime || shift.startTime;
    shift.endTime = endTime || shift.endTime;

    const updatedShift = await shift.save();

    if (incidents && incidents.length > 0) {
      // Assuming one incident per shift for this modal
      const incidentToUpdate = incidents[0];
      if (incidentToUpdate && incidentToUpdate._id) {
        await Incident.findByIdAndUpdate(incidentToUpdate._id, { description: incidentToUpdate.description });
      }
    }

    logAuditEvent({
      userId: adminId,
      action: 'SHIFT_UPDATE_ADMIN',
      details: { 
        shiftId: updatedShift._id,
        updatedBy: adminId,
        original: originalShift,
        updated: updatedShift.toObject(),
      },
      ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
    });

    return NextResponse.json(updatedShift);

  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
