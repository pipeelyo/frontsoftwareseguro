import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'VIGILANTE' | 'SUPERVISOR' | 'ADMIN' | 'CLIENTE' | 'ADMINISTRATIVO';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  emailVerified?: Date;
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  tokenVersion: number;
  role: UserRole;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  emailVerified: { type: Date, default: null },
  failedLoginAttempts: { type: Number, default: 0 },
  lockoutUntil: { type: Date, default: null },
  tokenVersion: { type: Number, default: 0 },
  role: { type: String, enum: ['VIGILANTE', 'SUPERVISOR', 'ADMIN', 'CLIENTE', 'ADMINISTRATIVO'], default: 'VIGILANTE' },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
