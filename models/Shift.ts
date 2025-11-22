import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IShift extends Document {
  userId: IUser['_id'];
  startTime: Date;
  endTime?: Date;
  startLocation?: { lat: number; lon: number };
  endLocation?: { lat: number; lon: number };
  status: 'ACTIVE' | 'COMPLETED';
}

const ShiftSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  startLocation: { 
    lat: { type: Number },
    lon: { type: Number },
  },
  endLocation: { 
    lat: { type: Number },
    lon: { type: Number },
  },
  status: { type: String, enum: ['ACTIVE', 'COMPLETED'], required: true },
}, { timestamps: true });

export default mongoose.models.Shift || mongoose.model<IShift>('Shift', ShiftSchema);
