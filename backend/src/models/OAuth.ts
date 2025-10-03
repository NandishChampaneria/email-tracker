import mongoose, { Schema, Document } from 'mongoose';

export interface GmailTokenDoc extends Document {
    email: string;
    access_token: string;
    refresh_token: string;
    scope?: string;
    token_type?: string;
    expiry_date?: number;
    createdAt: Date;
}

const GmailTokenSchema = new Schema<GmailTokenDoc>({
    email: { type: String, required: true },
    access_token: { type: String, required: true },
    refresh_token: { type: String, required: true },
    scope: { type: String },
    token_type: { type: String },
    expiry_date: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

export const GmailTokenModel = mongoose.model<GmailTokenDoc>('GmailToken', GmailTokenSchema);


