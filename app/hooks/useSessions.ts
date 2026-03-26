
import { useEffect, useState } from "react";
import { Session } from "../types/session";
import { supabase } from "@/lib/supabase/client";

export function useSessions() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const { data, error } = await supabase
                    .from("sessions")
                    .select("id, user_id, target_label, work_minutes, started_at, finished_at")
                    .order("started_at", { ascending: false });

                if (error) {
                    setError(error.message);
                    return;
                }
                const mapped = (data ?? []).map((row) => ({
                    id: row.id,
                    userId: row.user_id,
                    targetLabel: row.target_label,
                    workMinutes: row.work_minutes,
                    startedAt: row.started_at,
                    finishedAt: row.finished_at,
                }));
                setSessions(mapped);
            } catch (e) {
                setError("セッションの取得に失敗しました");
            } finally {
                setLoading(false);
            }
        }
        void fetchSessions();
    }, [])

    return { sessions, loading, error };
}