import { Request, Response } from 'express';
import { sendTrackedEmail } from '../services/mailService';
import { sendViaGmail } from '../services/gmailService';
import { getSmtpConfig, setSmtpConfig, SmtpConfig } from '../services/configService';

export async function sendEmail(req: Request, res: Response): Promise<void> {
	const { to, subject, html } = req.body || {};
	if (!to || !subject || !html) {
		res.status(400).json({ error: 'to, subject, html required' });
		return;
	}
	try {
        const useGmail = Boolean(req.query.gmail === '1' || req.body.gmail === true);
        const result = useGmail ? await sendViaGmail({ to, subject, html }) : await sendTrackedEmail({ to, subject, html });
		res.json(result);
	} catch (err: any) {
		res.status(500).json({ error: err?.message || 'send failed' });
	}
}

export function getSmtp(req: Request, res: Response): void {
    const cfg = getSmtpConfig();
    res.json(cfg || null);
}

export function setSmtp(req: Request, res: Response): void {
    const { host, port, user, pass, from, secure } = req.body || {};
    if (!host || !port || !user || !pass) {
        res.status(400).json({ error: 'host, port, user, pass required' });
        return;
    }
    const cfg: SmtpConfig = { host, port: Number(port), user, pass, from, secure: Boolean(secure) };
    setSmtpConfig(cfg);
    res.json({ ok: true });
}
