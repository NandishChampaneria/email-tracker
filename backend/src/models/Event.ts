import mongoose, { Schema, Document } from 'mongoose';

export type EventType = 'open' | 'click';

export interface EventDoc extends Document {
	emailUid: string;
	type: EventType;
	url?: string;
	ip?: string;
	userAgent?: string;
	device?: string;
	location?: string;
	createdAt: Date;
}

const EventSchema = new Schema<EventDoc>({
	emailUid: { type: String, required: true, index: true },
	type: { type: String, required: true, enum: ['open', 'click'], index: true },
	url: { type: String },
	ip: { type: String },
	userAgent: { type: String },
	device: { type: String },
	location: { type: String },
	createdAt: { type: Date, default: Date.now, index: true }
});

export const EventModel = mongoose.model<EventDoc>('Event', EventSchema);
