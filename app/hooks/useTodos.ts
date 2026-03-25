import { useEffect, useState } from "react";
import { Todo } from "../types/todo";
import { supabase } from "@/lib/supabase/client";

export function useTodos() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const { data, error } = await supabase
                    .from("todos")
                    .select()
                    .order("created_at", { ascending: true });

                if (error) {
                    setError(error.message);
                    return;
                }

                const mapped = data.map((row) => ({
                    id: row.id,
                    text: row.title,
                    isDone: row.is_completed,
                }));
                setTodos(mapped);

            } finally {
                setLoading(false);
            }
        }
        void fetchTodos();
    }, [])

    const addTodo = async (text: string) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const tempId = crypto.randomUUID();
        setTodos((prev) => [...prev, { id: tempId, text, isDone: false }]);

        const { data, error } = await supabase
            .from("todos")
            .insert({ user_id: user.id, title: text, is_completed: false })
            .select()
            .single();

        if (error) {
            setTodos((prev) => prev.filter((t) => t.id !== tempId));
            return;
        }

        const createdTodo: Todo = {
            id: data.id,
            text: data.label,
            isDone: data.is_completed
        }

        setTodos((prev) =>
            prev.map((t) => t.id === tempId ? { ...t, id: data.id } : t)
        );

        return createdTodo;
    }

    const toggleTodo = async (id: string) => {
        const targetTodo = todos.find((t) => t.id === id);
        if (!targetTodo) return;
        const nextIsDone = !targetTodo.isDone;

        setTodos((prev) => prev.map((t) => t.id === id ? { ...t, isDone: nextIsDone } : t));

        const { data, error } = await supabase
            .from("todos")
            .update({ is_completed: nextIsDone })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            setTodos((prev) => prev.map((t) => t.id === id ? { ...t, isDone: targetTodo.isDone } : t));
            return;
        }

        setTodos((prev) => prev.map((t) => t.id === id ? { ...t, isDone: data.is_completed } : t));
    }

    const deleteTodo = async (id: string) => {
        const copyTodo = [...todos];
        setTodos((prev) => prev.filter((t) => t.id !== id));

        const { error } = await supabase
            .from("todos")
            .delete()
            .eq("id", id)


        if (error) {
            setTodos(copyTodo);
            return;
        }
    }




    return { todos, loading, error, addTodo, toggleTodo, deleteTodo };
}