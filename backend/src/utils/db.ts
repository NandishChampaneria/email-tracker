import mongoose from 'mongoose';

export async function connectMongo(uri: string): Promise<void> {
	if (mongoose.connection.readyState === 1) return;
	await mongoose.connect(uri);
}
