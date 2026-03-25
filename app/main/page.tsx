"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Sidebar from "../components/layout/Sidebar";
import { useSessions } from "../hooks/useSessions";
import {
	getMonthWorkMinutes,
	getStreak,
	getTodayPomodoros,
	getTodayWorkMinutes,
	getWeekWorkMinutes,
} from "../utils/sessionCalc";
import WorkChart from "../components/dashboard/WorkChart";
import RecentSession from "../components/dashboard/RecentSessions";

export default function Main() {
	const [checking, setChecking] = useState(true);
	const router = useRouter();

	const { sessions, loading, error } = useSessions();

	const todayPomodoros = getTodayPomodoros(sessions);
	const todayMinutes = getTodayWorkMinutes(sessions);
	const weekMinutes = getWeekWorkMinutes(sessions);
	const monthMinutes = getMonthWorkMinutes(sessions);
	const streak = getStreak(sessions);

	useEffect(() => {
		const run = async () => {
			const { data, error } = await supabase.auth.getUser();
			if (error || !data.user) {
				router.replace("/signin");
				return;
			}
			setChecking(false);
		};
		run();
	}, [router]);

	if (checking || loading) {
		return <div>Loading...</div>;
	}

	if (error) return <div>エラー: {error}</div>;

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<div className="flex-1 bg-gray-100">
				<header className="bg-white px-6 py-4 border-b border-gray-200">
					<h1 className="text-3xl font-bold">学習ダッシュボード</h1>
				</header>
				<main className="flex-1 bg-gray-100 p-6">
					<div className="grid grid-cols-4 gap-4 mb-6">
						<div className="bg-white p-4 rounded shadow ">
							<div className="text-sm opacity-75">
								今日のポモドーロ
							</div>
							<div className="text-3xl">{todayPomodoros}</div>
						</div>
						<div className="bg-white p-4 rounded shadow">
							<div className="text-sm opacity-75">
								今日の作業時間
							</div>
							<div className="text-3xl">{todayMinutes}分</div>
						</div>
						<div className="bg-white p-4 rounded shadow">
							<div className="text-sm opacity-75">
								今週の作業時間
							</div>
							<div className="text-3xl">{weekMinutes}分</div>
						</div>
						<div className="bg-white p-4 rounded shadow">
							<div className="text-sm opacity-75">
								今月の作業時間
							</div>
							<div className="text-3xl">{monthMinutes}分</div>
						</div>
					</div>
					<div className="grid grid-cols-[3fr_1fr] gap-4 mb-6">
						<div className="bg-white p-4 rounded shadow">
							<div className="text-sm opacity-75">
								直近7日間の作業時間（分）
							</div>
							<WorkChart sessions={sessions} />
						</div>
						<div className="bg-white p-4 rounded shadow">
							<div className="text-sm opacity-75">連続日数</div>
							<div className="text-3xl">{streak}日</div>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-4 mb-6">
						<div className="bg-white p-4 rounded shadow">
							<div className="text-xs opacity-75 mb-1">
								最近のセッション
							</div>
							<RecentSession sessions={sessions} />
						</div>
						<div className="bg-white p-4 rounded shadow">
							<div className="text-xs opacity-75 mb-1">
								未完了のTodo
							</div>
							<div className="text-sm mb-1">Todo1</div>
							<div className="text-sm mb-1">Todo2</div>
							<div className="text-sm mb-1">Todo3</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
