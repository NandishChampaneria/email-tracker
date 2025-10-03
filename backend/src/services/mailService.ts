import nodemailer from 'nodemailer';
import { EmailModel } from '../models/Email';
import crypto from 'crypto';
import { getSmtpConfig } from './configService';

const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:4000';

function generateUid(): string {
	return crypto.randomBytes(12).toString('hex');
}

function rewriteLinks(html: string, uid: string): string {
	return html.replace(/href=\"([^\"]+)\"/g, (m, p1) => {
		const tracked = `${appBaseUrl}/track/click?id=${encodeURIComponent(uid)}&url=${encodeURIComponent(p1)}`;
		return `href=\"${tracked}\"`;
	});
}

function injectPixel(html: string, uid: string): string {
    const ts = Date.now();
    const pixel = `<img src="${appBaseUrl}/track/open?id=${encodeURIComponent(uid)}&ts=${ts}" alt="" width="1" height="1" style="opacity:0;display:block" aria-hidden="true" />`;
	if (html.includes('</body>')) return html.replace('</body>', `${pixel}</body>`);
	return html + pixel;
}

export async function sendTrackedEmail(args: { to: string; subject: string; html: string }): Promise<{ uid: string; previewUrl?: string }>{
	const uid = generateUid();
	const htmlTracked = injectPixel(rewriteLinks(args.html, uid), uid);

	let transporter: nodemailer.Transporter;
	let usingEthereal = false;
	const runtime = getSmtpConfig();
	if (runtime) {
		transporter = nodemailer.createTransport({
			host: runtime.host,
			port: runtime.port,
			secure: Boolean(runtime.secure),
			auth: { user: runtime.user, pass: runtime.pass }
		});
	} else if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
		const testAccount = await nodemailer.createTestAccount();
		transporter = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false,
			auth: { user: testAccount.user, pass: testAccount.pass }
		});
		usingEthereal = true;
	} else {
		transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT || 587),
			secure: false,
			auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
		});
	}

	await EmailModel.create({ uid, to: args.to, subject: args.subject, htmlOriginal: args.html });

	const info = await transporter.sendMail({
		from: (runtime?.from) || process.env.FROM_EMAIL || 'Tracker <no-reply@example.com>',
		to: args.to,
		subject: args.subject,
		html: htmlTracked
	});

	const previewUrl = usingEthereal ? nodemailer.getTestMessageUrl(info) || undefined : undefined;

	return { uid, previewUrl };
}
