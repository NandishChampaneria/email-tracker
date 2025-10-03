import mongoose, { Schema, Document } from 'mongoose';

export interface EmailDoc extends Document {
	uid: string;
	to: string;
	subject: string;
	htmlOriginal: string;
	createdAt: Date;
}

const EmailSchema = new Schema<EmailDoc>({
	uid: { type: String, required: true, unique: true, index: true },
	to: { type: String, required: true },
	subject: { type: String, required: true },
	htmlOriginal: { type: String, required: true },
	createdAt: { type: Date, default: Date.now }
});

export const EmailModel = mongoose.model<EmailDoc>('Email', EmailSchema);
