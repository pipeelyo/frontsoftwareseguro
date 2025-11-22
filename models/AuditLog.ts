import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Schema.Types.ObjectId;
  action: string;
  timestamp: Date;
  details?: object;
  ipAddress?: string;
}

const AuditLogSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
});

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
