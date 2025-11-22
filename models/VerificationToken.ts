import mongoose, { Schema, Document } from 'mongoose';

export interface IVerificationToken extends Document {
  token: string;
  expires: Date;
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' | 'EMAIL_CHANGE';
  userId: mongoose.Schema.Types.ObjectId;
  newEmail?: string;
}

const VerificationTokenSchema: Schema = new Schema({
  token: { type: String, required: true },
  expires: { type: Date, required: true },
  type: { type: String, required: true, enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGE'] },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  newEmail: { type: String },
}, { timestamps: true });

export default mongoose.models.VerificationToken || mongoose.model<IVerificationToken>('VerificationToken', VerificationTokenSchema);
