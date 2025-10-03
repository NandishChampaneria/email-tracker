import { useEffect, useState } from 'react';
import { fetchEmails, fetchSeries, sendEmail, EmailRow, getGoogleAuthUrl, sendEmailViaGmail, getGoogleStatus } from '../lib/api';
import EmailTable from '../components/EmailTable';
import SeriesChart from '../components/SeriesChart';

export default function App() {
	const [rows, setRows] = useState<EmailRow[]>([]);
	const [selected, setSelected] = useState<string | null>(null);
	const [series, setSeries] = useState<Array<{ time: string; type: 'open' | 'click'; url?: string }>>([]);
	const [sending, setSending] = useState(false);
	const [form, setForm] = useState({ to: '', subject: '', html: '' });
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [gmailStatus, setGmailStatus] = useState<{ email: string } | null>(null);
	const [connecting, setConnecting] = useState(false);

	useEffect(() => {
		fetchEmails().then(setRows).catch(console.error);
		getGoogleStatus().then(setGmailStatus).catch(() => setGmailStatus(null));
	}, []);

	useEffect(() => {
		if (!selected) return;
		fetchSeries(selected).then(setSeries).catch(console.error);
	}, [selected]);

	return (
		<div className="min-h-screen p-6">
			<div className="max-w-4xl mx-auto space-y-6">
				<header className="glass-card rounded-2xl p-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Email Tracker</h1>
							<p className="text-white/70 mt-1">Track opens and clicks from your emails</p>
						</div>
						<div className="flex items-center gap-4">
							{gmailStatus ? (
								<div className="flex items-center gap-3">
									<div className="text-right">
										<div className="text-sm text-white/70">Connected as</div>
										<div className="font-medium">{gmailStatus.email}</div>
									</div>
									<button 
										onClick={() => {
											setGmailStatus(null);
										}}
										className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30"
									>
										Logout
									</button>
								</div>
							) : (
								<button 
									onClick={async () => {
										setConnecting(true);
										try {
											const url = await getGoogleAuthUrl();
											window.open(url, '_blank', 'width=480,height=720');
											// Check status after a delay
											setTimeout(() => {
												getGoogleStatus().then(setGmailStatus).catch(() => setGmailStatus(null));
												setConnecting(false);
											}, 3000);
										} catch (e) {
											setConnecting(false);
										}
									}}
									disabled={connecting}
									className="px-6 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 disabled:opacity-50"
								>
									{connecting ? 'Connecting...' : 'Connect Gmail'}
								</button>
							)}
						</div>
					</div>
				</header>

				<section className="glass-card rounded-2xl p-6 space-y-4">
					<h2 className="text-xl font-semibold">Send Tracked Email</h2>
					{!gmailStatus && (
						<div className="bg-amber-500/20 border border-amber-400/30 rounded-lg p-3 text-amber-200 text-sm">
							⚠️ Connect Gmail to send emails. Without Gmail connection, emails will use SMTP fallback.
						</div>
					)}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<input
							className="glass-input rounded-lg px-4 py-3 text-white placeholder-white/60"
							type="email"
							placeholder="Recipient email"
							value={form.to}
							onChange={e => setForm({ ...form, to: e.target.value })}
						/>
						<input
							className="glass-input rounded-lg px-4 py-3 text-white placeholder-white/60"
							type="text"
							placeholder="Subject"
							value={form.subject}
							onChange={e => setForm({ ...form, subject: e.target.value })}
						/>
						<button
							className="rounded-lg px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={sending || !form.to || !form.subject || !form.html}
							onClick={async () => {
								try {
									setSending(true);
									const res = gmailStatus ? await sendEmailViaGmail(form) : await sendEmail(form);
									setForm({ to: '', subject: '', html: '' });
									await fetchEmails().then(setRows);
									setSelected(res.uid);
									setPreviewUrl((res as any).previewUrl || null);
								} catch (err) {
									console.error(err);
								} finally {
									setSending(false);
								}
							}}
						>
							{sending ? 'Sending…' : 'Send Email'}
						</button>
					</div>
					<textarea
						className="glass-input rounded-lg px-4 py-3 w-full h-40 font-mono text-white placeholder-white/60"
						placeholder="HTML body (links will be tracked, pixel auto-inserted)"
						value={form.html}
						onChange={e => setForm({ ...form, html: e.target.value })}
					/>
				</section>

				{previewUrl && (
					<div className="glass-card rounded-2xl p-4 flex items-center justify-between text-amber-200">
						<div className="text-sm truncate">
							<span className="font-medium">Ethereal preview:</span> <a className="underline" href={previewUrl} target="_blank" rel="noreferrer">{previewUrl}</a>
						</div>
						<button
							className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15"
							onClick={() => navigator.clipboard.writeText(previewUrl)}
						>
							Copy
						</button>
					</div>
				)}
				<EmailTable rows={rows} onSelect={setSelected} />
				{selected && (
					<div className="glass-card rounded-2xl p-6 space-y-4">
						<div className="text-sm text-white/70">Time series for <span className="font-mono text-white">{selected}</span></div>
						<SeriesChart data={series} />
					</div>
				)}
			</div>
		</div>
	);
}