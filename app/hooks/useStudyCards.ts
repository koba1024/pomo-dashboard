import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { StudyCard } from "../types/studyCard";

export function useStudyCards() {
    const [studyCards, setStudyCards] = useState<StudyCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudyCards = async () => {
            try {
                const { data, error } = await supabase
                    .from("study_cards")
                    .select()
                    .order("created_at", { ascending: true });

                if (error) {
                    setError(error.message);
                    return;
                }

                const mapped = (data ?? []).map((row) => ({
                    id: row.id,
                    label: row.label,
                }));
                setStudyCards(mapped);

            } catch (e) {
                setError("学習カードの取得に失敗しました");
            } finally {
                setLoading(false);
            }
        }
        void fetchStudyCards();
    }, [])

    const addStudyCard = async (label: string) => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
            setError(authError.message);
            return;
        }
        if (!user) return;

        const tempId = crypto.randomUUID();
        setStudyCards((prev) => [...prev, { id: tempId, label }]);

        const { data, error } = await supabase
            .from("study_cards")
            .insert({ user_id: user.id, label })
            .select("id, label")
            .single();

        if (error) {
            setStudyCards((prev) => prev.filter((t) => t.id !== tempId));
            return;
        }

        const createdCard: StudyCard = {
            id: data.id,
            label: data.label
        };

        setStudyCards((prev) =>
            prev.map((card) => card.id === tempId ? { ...card, id: data.id } : card)
        );

        return createdCard;

    }

    const deleteStudyCard = async (id: string) => {
        const copyStudyCard = [...studyCards];
        setStudyCards((prev) => prev.filter((card) => card.id !== id));

        const { error } = await supabase
            .from("study_cards")
            .delete()
            .eq("id", id)


        if (error) {
            setStudyCards(copyStudyCard);
            return;
        }
    }




    return { studyCards, loading, error, addStudyCard, deleteStudyCard };
}