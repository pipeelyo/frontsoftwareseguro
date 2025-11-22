import dbConnect from './db';
import AuditLog from '../models/AuditLog';
import mongoose from 'mongoose';

interface AuditEvent {
  userId?: string | mongoose.Types.ObjectId;
  action: string;
  details?: object;
  ipAddress?: string;
}

export const logAuditEvent = async (event: AuditEvent) => {
  try {
    await dbConnect();
    const auditLog = new AuditLog({
      ...event,
      timestamp: new Date(),
    });
    await auditLog.save();
  } catch (error) {
    console.error('Failed to save audit event:', error);
    // In a real-world scenario, you might want to have a fallback logging mechanism here.
  }
};
