import { EmailRow } from '../lib/api';

export default function EmailTable({ rows, onSelect }: { rows: EmailRow[]; onSelect: (uid: string) => void }) {
	return (
		<div className="overflow-x-auto bg-white shadow rounded">
			<table className="min-w-full text-left text-sm">
				<thead className="bg-gray-100 text-gray-700">
					<tr>
						<th className="px-4 py-2">UID</th>
						<th className="px-4 py-2">To</th>
						<th className="px-4 py-2">Subject</th>
						<th className="px-4 py-2">Opens</th>
						<th className="px-4 py-2">Clicks</th>
						<th className="px-4 py-2">Last Opened</th>
					</tr>
				</thead>
				<tbody>
					{rows.map(r => (
						<tr key={r.uid} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(r.uid)}>
							<td className="px-4 py-2 font-mono text-xs">{r.uid}</td>
							<td className="px-4 py-2">{r.to}</td>
							<td className="px-4 py-2">{r.subject}</td>
							<td className="px-4 py-2">{r.opens}</td>
							<td className="px-4 py-2">{r.clicks}</td>
							<td className="px-4 py-2">{r.lastOpened ? new Date(r.lastOpened).toLocaleString() : '-'}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
