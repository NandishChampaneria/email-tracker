import axios from 'axios';

const client = axios.create({ baseURL: 'http://localhost:4000' });

export type EmailRow = {
	uid: string;
	to: string;
	subject: string;
	createdAt: string;
	opens: number;
	clicks: number;
	lastOpened: string | null;
};

export async function fetchEmails(): Promise<EmailRow[]> {
	const { data } = await client.get('/api/emails');
	return data;
}

export async function fetchSeries(uid: string): Promise<Array<{ time: string; type: 'open' | 'click'; url?: string }>> {
	const { data } = await client.get(`/api/emails/${uid}/series`);
	return data;
}

export async function sendEmail(args: { to: string; subject: string; html: string }): Promise<{ uid: string; previewUrl?: string }>{
    const { data } = await client.post('/api/send-email', args);
    return data;
}

export type SmtpConfig = { host: string; port: number; user: string; pass: string; from?: string; secure?: boolean };
export async function getSmtp(): Promise<SmtpConfig | null> {
    const { data } = await client.get('/api/smtp');
    return data;
}
export async function setSmtp(cfg: SmtpConfig): Promise<{ ok: true }>{
    const { data } = await client.post('/api/smtp', cfg);
    return data;
}

export async function getGoogleAuthUrl(): Promise<string> {
    const { data } = await client.get('/api/google/oauth/url');
    return data.url as string;
}

export async function sendEmailViaGmail(args: { to: string; subject: string; html: string }): Promise<{ uid: string }>{
    const { data } = await client.post('/api/send-email?gmail=1', args);
    return data;
}
