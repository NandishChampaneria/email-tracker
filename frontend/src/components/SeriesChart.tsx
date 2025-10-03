import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SeriesChart({ data }: { data: Array<{ time: string; type: 'open' | 'click'; url?: string }> }) {
	const points = data.map(d => ({
		time: new Date(d.time).toLocaleString(),
		open: d.type === 'open' ? 1 : 0,
		click: d.type === 'click' ? 1 : 0
	}));
	return (
		<div className="h-80">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={points}>
					<CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="5 5" />
					<XAxis 
						dataKey="time" 
						hide={false} 
						minTickGap={20}
						tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
					/>
					<YAxis 
						allowDecimals={false}
						tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
					/>
					<Tooltip 
						contentStyle={{
							backgroundColor: 'rgba(0,0,0,0.8)',
							border: '1px solid rgba(255,255,255,0.2)',
							borderRadius: '8px',
							color: 'white'
						}}
					/>
					<Line type="monotone" dataKey="open" stroke="#10b981" strokeWidth={2} dot={false} />
					<Line type="monotone" dataKey="click" stroke="#3b82f6" strokeWidth={2} dot={false} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}