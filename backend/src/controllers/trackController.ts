import { Request, Response } from 'express';
import { EventModel } from '../models/Event';
import { transparentGifBuffer } from '../utils/pixel';
import { parseUserAgent } from '../utils/ua';

function getClientIp(req: Request): string | undefined {
	const xfwd = (req.headers['x-forwarded-for'] as string) || '';
	return (xfwd.split(',')[0] || req.socket.remoteAddress || '').toString();
}

export async function trackOpen(req: Request, res: Response): Promise<void> {
	const emailUid = (req.query.id as string) || '';
	if (!emailUid) {
		res.status(400).end();
		return;
	}
	const ip = getClientIp(req);
	const ua = req.headers['user-agent'] as string | undefined;
	const { device } = parseUserAgent(ua);
	await EventModel.create({ emailUid, type: 'open', ip, userAgent: ua, device });
	res.setHeader('Content-Type', 'image/gif');
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
	res.setHeader('Content-Length', transparentGifBuffer.length.toString());
	res.status(200).end(transparentGifBuffer);
}

export async function trackClick(req: Request, res: Response): Promise<void> {
	const emailUid = (req.query.id as string) || '';
	const url = (req.query.url as string) || '';
	if (!emailUid || !url) {
		res.status(400).send('Missing id or url');
		return;
	}
	const ip = getClientIp(req);
	const ua = req.headers['user-agent'] as string | undefined;
	const { device } = parseUserAgent(ua);
	await EventModel.create({ emailUid, type: 'click', url, ip, userAgent: ua, device });
	res.redirect(url);
}
