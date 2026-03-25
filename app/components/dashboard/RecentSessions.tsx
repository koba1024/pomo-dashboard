import { Session } from "@/app/types/session";

function RecentSession({ sessions }: { sessions: Session[] }) {
	const recentSessions = sessions.slice(0, 5);

	return recentSessions.map((session) => {
		const targetLabel = session.targetLabel;
		const workMinute = session.workMinutes;
		const day = new Date(session.finishedAt).toLocaleString("ja-JP");

		return (
			<div key={session.id} className="text-sm mb-1">
				[{targetLabel}] [{workMinute}分] [{day}]
			</div>
		);
	});
}

export default RecentSession;
