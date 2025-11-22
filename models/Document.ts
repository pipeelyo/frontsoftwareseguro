import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  filename: string;
  contentType: string;
  data: Buffer;
  hash: string;
  version: number;
  uploadedBy: mongoose.Schema.Types.ObjectId;
  originalDocumentId: mongoose.Schema.Types.ObjectId;
}

const DocumentSchema: Schema = new Schema({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  data: { type: Buffer, required: true },
  hash: { type: String, required: true },
  version: { type: Number, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  originalDocumentId: { type: Schema.Types.ObjectId, ref: 'Document' },
}, { timestamps: true });

// To handle versioning, we can add a pre-save hook to increment version if a document with the same filename is updated
// For simplicity in this step, we'll focus on creation. Versioning can be an enhancement.

const Document = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
export default Document;
