import { Request, Response } from 'express';
import { EmailModel } from '../models/Email';
import { EventModel } from '../models/Event';

export async function listEmails(req: Request, res: Response): Promise<void> {
	const emails = await EmailModel.find().sort({ createdAt: -1 }).limit(200).lean();
	const uids = emails.map(e => e.uid);
	const counts = await EventModel.aggregate([
		{ $match: { emailUid: { $in: uids } } },
		{ $group: { _id: { uid: '$emailUid', type: '$type' }, count: { $sum: 1 }, last: { $max: '$createdAt' } } }
	]);
	const byUid: Record<string, { opens: number; clicks: number; lastOpened?: Date }> = {};
	for (const c of counts) {
		const uid = c._id.uid as string;
		byUid[uid] = byUid[uid] || { opens: 0, clicks: 0 } as any;
		if (c._id.type === 'open') {
			byUid[uid].opens = c.count;
			byUid[uid].lastOpened = c.last;
		} else if (c._id.type === 'click') {
			byUid[uid].clicks = c.count;
		}
	}
	const result = emails.map(e => ({
		uid: e.uid,
		to: e.to,
		subject: e.subject,
		createdAt: e.createdAt,
		opens: byUid[e.uid]?.opens || 0,
		clicks: byUid[e.uid]?.clicks || 0,
		lastOpened: byUid[e.uid]?.lastOpened || null
	}));
	res.json(result);
}

export async function emailTimeSeries(req: Request, res: Response): Promise<void> {
	const uid = req.params.uid;
	const events = await EventModel.find({ emailUid: uid }).sort({ createdAt: 1 }).lean();
	const series = events.map(e => ({
		time: e.createdAt,
		type: e.type,
		url: e.url
	}));
	res.json(series);
}
