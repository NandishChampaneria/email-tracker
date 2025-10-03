import { google } from 'googleapis';
import { GmailTokenModel } from '../models/OAuth';
import { injectPixel, rewriteLinks } from './trackingHtml';
import { EmailModel } from '../models/Email';
import crypto from 'crypto';

function generateUid(): string {
    return crypto.randomBytes(12).toString('hex');
}

export function getOAuth2Client() {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/google/oauth/callback';
    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getAuthUrl(): string {
    const oauth2Client = getOAuth2Client();
    const scopes = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/userinfo.email', 'openid', 'email', 'profile'];
    return oauth2Client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: scopes });
}

export async function handleOAuthCallback(code: string): Promise<{ email: string }>{
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const me = await oauth2.userinfo.get();
    const email = me.data.email as string;
    await GmailTokenModel.findOneAndUpdate({ email }, { ...tokens, email }, { upsert: true });
    return { email };
}

export async function sendViaGmail(args: { to: string; subject: string; html: string }): Promise<{ uid: string }>{
    const record = await GmailTokenModel.findOne().sort({ createdAt: -1 }).lean();
    if (!record) throw new Error('Gmail not connected');
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
        access_token: record.access_token,
        refresh_token: record.refresh_token,
        scope: record.scope,
        token_type: record.token_type,
        expiry_date: record.expiry_date
    });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:4000';
    const uid = generateUid();
    const htmlTracked = injectPixel(rewriteLinks(args.html, uid, appBaseUrl), uid, appBaseUrl);

    const message = [
        `From: ${record.email}`,
        `To: ${args.to}`,
        `Subject: ${args.subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        '',
        htmlTracked
    ].join('\r\n');
    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    await gmail.users.messages.send({ userId: 'me', requestBody: { raw: encodedMessage } });
    await EmailModel.create({ uid, to: args.to, subject: args.subject, htmlOriginal: args.html });
    return { uid };
}

export async function getConnectedAccount(): Promise<{ email: string } | null> {
    const record = await GmailTokenModel.findOne().sort({ createdAt: -1 }).lean();
    if (!record) return null;
    return { email: record.email };
}


