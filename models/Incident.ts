import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IShift } from './Shift';

export interface IIncident extends Document {
  shiftId: IShift['_id'];
  userId: IUser['_id'];
  description: string;
  timestamp: Date;
  location?: { lat: number; lon: number };
}

const IncidentSchema: Schema = new Schema({
  shiftId: { type: Schema.Types.ObjectId, ref: 'Shift', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  location: {
    lat: { type: Number },
    lon: { type: Number },
  },
}, { timestamps: true });

const Incident = mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema);
export default Incident;
