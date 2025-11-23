import dbConnect from '@/lib/db';
import Shift from '@/models/Shift';
import User from '@/models/User'; // Ensure User model is registered
import Incident from '@/models/Incident'; // Ensure Incident model is registered

export async function getShiftsForUser(userId: string, userRole: string) {
  await dbConnect();

  let shifts;
  if (userRole === 'ADMIN' || userRole === 'SUPERVISOR') {
    shifts = await Shift.find({}).populate('userId', 'name email').sort({ startTime: -1 }).lean();
  } else {
    shifts = await Shift.find({ userId }).sort({ startTime: -1 }).lean();
  }

  const shiftIds = shifts.map(s => s._id);
  const incidents = await Incident.find({ shiftId: { $in: shiftIds } }).lean();

  const shiftsWithIncidents = shifts.map(shift => {
    const shiftIncidents = incidents.filter(i => i.shiftId.toString() === shift._id.toString());
    return {
      ...shift,
      incidents: shiftIncidents,
    };
  });

  return JSON.parse(JSON.stringify(shiftsWithIncidents));
}

export async function getActiveShiftForUser(userId: string) {
  await dbConnect();

  const activeShift = await Shift.findOne({ userId, endTime: null });

  if (!activeShift) {
    return null;
  }

  return JSON.parse(JSON.stringify(activeShift));
}
