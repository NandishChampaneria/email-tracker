import { Router } from 'express';
import { trackOpen, trackClick } from '../controllers/trackController';
import { listEmails, emailTimeSeries } from '../controllers/statsController';
import { sendEmail, getSmtp, setSmtp } from '../controllers/emailController';
import { getAuthUrl } from '../services/gmailService';
import { handleOAuthCallback } from '../services/gmailService';
import { getConnectedAccount } from '../services/gmailService';

const router = Router();

router.get('/track/open', trackOpen);
router.get('/track/click', trackClick);

router.get('/api/emails', listEmails);
router.get('/api/emails/:uid/series', emailTimeSeries);

router.post('/api/send-email', sendEmail);
router.get('/api/smtp', getSmtp);
router.post('/api/smtp', setSmtp);

router.get('/api/google/oauth/url', (req, res) => {
	res.json({ url: getAuthUrl() });
});
router.get('/api/google/oauth/callback', async (req, res) => {
	try {
		const code = (req.query.code as string) || '';
		if (!code) return res.status(400).send('Missing code');
		const result = await handleOAuthCallback(code);
		res.send(`Connected Gmail: ${result.email}. You can close this window.`);
	} catch (e: any) {
		res.status(500).send(e?.message || 'OAuth failed');
	}
});

router.get('/api/google/status', async (req, res) => {
	try {
		const acct = await getConnectedAccount();
		res.json(acct || null);
	} catch (e: any) {
		res.status(500).json({ error: e?.message || 'status failed' });
	}
});

export default router;
