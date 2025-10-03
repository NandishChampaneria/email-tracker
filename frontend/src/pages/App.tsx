import { useEffect, useState } from 'react';
import { fetchEmails, fetchSeries, sendEmail, EmailRow, getGoogleAuthUrl, sendEmailViaGmail } from '../lib/api';
import EmailTable from '../components/EmailTable';
import SeriesChart from '../components/SeriesChart';

export default function App() {
	const [rows, setRows] = useState<EmailRow[]>([]);
	const [selected, setSelected] = useState<string | null>(null);
	const [series, setSeries] = useState<Array<{ time: string; type: 'open' | 'click'; url?: string }>>([]);
	const [sending, setSending] = useState(false);
	const [form, setForm] = useState({ to: '', subject: '', html: '' });
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [useGmail, setUseGmail] = useState(false);

	useEffect(() => {
		fetchEmails().then(setRows).catch(console.error);
	}, []);

	useEffect(() => {
		if (!selected) return;
		fetchSeries(selected).then(setSeries).catch(console.error);
	}, [selected]);

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-6">
			<header className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Email Tracker</h1>
			</header>

			<section className="bg-white shadow rounded p-4 space-y-3">
				<h2 className="text-lg font-medium">Send Tracked Email</h2>
				<div className="flex items-center gap-3 text-sm">
					<label className="flex items-center gap-2"><input type="checkbox" checked={useGmail} onChange={e => setUseGmail(e.target.checked)} /> Send via Gmail</label>
					<button className="text-blue-600 underline" onClick={async () => {
						const url = await getGoogleAuthUrl();
						window.open(url, '_blank', 'width=480,height=720');
					}}>Connect Gmail</button>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<input
						className="border rounded px-3 py-2"
						type="email"
						placeholder="Recipient email"
						value={form.to}
						onChange={e => setForm({ ...form, to: e.target.value })}
					/>
					<input
						className="border rounded px-3 py-2"
						type="text"
						placeholder="Subject"
						value={form.subject}
						onChange={e => setForm({ ...form, subject: e.target.value })}
					/>
					<button
						className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
						disabled={sending || !form.to || !form.subject || !form.html}
						onClick={async () => {
							try {
								setSending(true);
								const res = useGmail ? await sendEmailViaGmail(form) : await sendEmail(form);
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
					className="border rounded px-3 py-2 w-full h-40 font-mono"
					placeholder="HTML body (links will be tracked, pixel auto-inserted)"
					value={form.html}
					onChange={e => setForm({ ...form, html: e.target.value })}
				/>
			</section>

			{previewUrl && (
				<div className="bg-amber-50 border border-amber-200 text-amber-900 rounded p-3 flex items-center justify-between">
					<div className="text-sm truncate">
						<span className="font-medium">Ethereal preview:</span> <a className="underline" href={previewUrl} target="_blank" rel="noreferrer">{previewUrl}</a>
					</div>
					<button
						className="text-xs bg-amber-200 hover:bg-amber-300 rounded px-2 py-1"
						onClick={() => navigator.clipboard.writeText(previewUrl)}
					>
						Copy
					</button>
				</div>
			)}
			<EmailTable rows={rows} onSelect={setSelected} />
			{selected && (
				<div className="space-y-2">
					<div className="text-sm text-gray-600">Time series for <span className="font-mono">{selected}</span></div>
					<SeriesChart data={series} />
				</div>
			)}
		</div>
	);
}
