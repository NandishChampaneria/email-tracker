import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SeriesChart({ data }: { data: Array<{ time: string; type: 'open' | 'click'; url?: string }> }) {
	const points = data.map(d => ({
		time: new Date(d.time).toLocaleString(),
		open: d.type === 'open' ? 1 : 0,
		click: d.type === 'click' ? 1 : 0
	}));
	return (
		<div className="bg-white shadow rounded p-4 h-80">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={points}>
					<CartesianGrid stroke="#eee" strokeDasharray="5 5" />
					<XAxis dataKey="time" hide={false} minTickGap={20} />
					<YAxis allowDecimals={false} />
					<Tooltip />
					<Line type="monotone" dataKey="open" stroke="#22c55e" dot={false} />
					<Line type="monotone" dataKey="click" stroke="#3b82f6" dot={false} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
