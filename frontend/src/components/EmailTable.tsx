import { EmailRow } from '../lib/api';

export default function EmailTable({ rows, onSelect }: { rows: EmailRow[]; onSelect: (uid: string) => void }) {
	return (
		<div className="glass-card rounded-2xl overflow-hidden">
			<div className="overflow-x-auto">
				<table className="min-w-full text-left text-sm">
					<thead className="bg-white/10">
						<tr>
							<th className="px-6 py-4 text-white/70 font-medium">UID</th>
							<th className="px-6 py-4 text-white/70 font-medium">To</th>
							<th className="px-6 py-4 text-white/70 font-medium">Subject</th>
							<th className="px-6 py-4 text-white/70 font-medium">Opens</th>
							<th className="px-6 py-4 text-white/70 font-medium">Clicks</th>
							<th className="px-6 py-4 text-white/70 font-medium">Last Opened</th>
						</tr>
					</thead>
					<tbody>
						{rows.map(r => (
							<tr key={r.uid} className="border-t border-white/10 hover:bg-white/5 cursor-pointer transition-colors" onClick={() => onSelect(r.uid)}>
								<td className="px-6 py-4 font-mono text-xs text-white/80">{r.uid}</td>
								<td className="px-6 py-4 text-white">{r.to}</td>
								<td className="px-6 py-4 text-white">{r.subject}</td>
								<td className="px-6 py-4 text-white">
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-200">
										{r.opens}
									</span>
								</td>
								<td className="px-6 py-4 text-white">
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-200">
										{r.clicks}
									</span>
								</td>
								<td className="px-6 py-4 text-white/70">{r.lastOpened ? new Date(r.lastOpened).toLocaleString() : '-'}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}