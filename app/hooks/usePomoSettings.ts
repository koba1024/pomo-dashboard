import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { PomodoroSettings } from "../types/timer";


export function usePomoSettings() {
    const [pomoSettings, setPomoSettings] = useState<PomodoroSettings | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPomoSettings = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) {
                    setError(sessionError.message);
                    return;
                }
                if (!session) return;

                const { data, error } = await supabase
                    .from("user_settings")
                    .select("work_minutes, break_minutes, selected_work, selected_break")
                    .eq("user_id", session.user.id)
                    .single();

                if (error) {
                    if (error.code === "PGRST116") {
                        setPomoSettings({
                            workMinutes: [1],
                            breakMinutes: [1],
                            selectedWorkMinutes: 1,
                            selectedBreakMinutes: 1,
                        });
                        return;
                    }

                    setError(error.message);
                    return;
                }

                setPomoSettings({
                    workMinutes: data.work_minutes,
                    breakMinutes: data.break_minutes,
                    selectedWorkMinutes: data.selected_work,
                    selectedBreakMinutes: data.selected_break
                });

            } catch (e) {
                setError("設定の取得に失敗しました");
            } finally {
                setLoading(false);
            }
        }
        void fetchPomoSettings();
    }, [])


    const saveSettings = async (newSettings: PomodoroSettings) => {
        const copySettings = pomoSettings;
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            setError(sessionError.message);
            return;
        }
        if (!session) return;

        setPomoSettings(newSettings);

        const { error } = await supabase
            .from("user_settings")
            .upsert({
                user_id: session.user.id,
                work_minutes: newSettings.workMinutes,
                break_minutes: newSettings.breakMinutes,
                selected_work: newSettings.selectedWorkMinutes,
                selected_break: newSettings.selectedBreakMinutes
            }, { onConflict: "user_id" });

        if (error) {
            setPomoSettings(copySettings);
            setError(error.message);
            return;
        }
    }



    return { pomoSettings, error, loading, saveSettings };
}