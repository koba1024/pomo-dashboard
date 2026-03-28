import { Session } from "@/app/types/session";
import { getWeeklyChartData } from "@/app/utils/sessionCalc";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

function WorkChart({ sessions }: { sessions: Session[] }) {
	const data = getWeeklyChartData(sessions);

	return (
		<ResponsiveContainer width="100%" height={200}>
			<BarChart data={data}>
				<XAxis dataKey="date" />
				<YAxis />
				<Tooltip />
				<Bar dataKey="minutes" fill="#3b82f6" />
			</BarChart>
		</ResponsiveContainer>
	);
}

export default WorkChart;
