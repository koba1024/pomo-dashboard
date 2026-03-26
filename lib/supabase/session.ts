import { supabase } from "@/lib/supabase/client";

export async function saveSession({
	targetLabel,
	workMinutes,
	startedAt,
	finishedAt,
}: {
	targetLabel: string;
	workMinutes: number;
	startedAt: Date;
	finishedAt: Date;
}) {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) throw new Error("ログインが必要です");

	const { error } = await supabase.from("sessions").insert({
		user_id: user.id,
		target_label: targetLabel,
		work_minutes: workMinutes,
		started_at: startedAt.toISOString(),
		finished_at: finishedAt.toISOString(),
	});

	if (error) throw error;
}
