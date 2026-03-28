"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/layout/Sidebar";
import { useTodos } from "../hooks/useTodos";
import { MAX_TARGET_OPTION_COUNT } from "../constants/timer";
import { supabase } from "@/lib/supabase/client";
import Header from "../components/layout/Header";

function TodoPage() {
	const router = useRouter();
	const [checking, setChecking] = useState(true);
	const { todos, loading, error, addTodo, toggleTodo, deleteTodo } =
		useTodos();
	const [inputText, setInputText] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		const checkAuth = async () => {
			const { data, error } = await supabase.auth.getUser();
			if (error || !data.user) {
				router.replace("/signin");
				return;
			}
			setChecking(false);
		};
		void checkAuth();
	}, [router]);

	const handleAdd = () => {
		if (inputText.trim() === "") {
			setErrorMessage("何も入力されていないです。");
			return;
		}
		if (todos.length >= MAX_TARGET_OPTION_COUNT) {
			setErrorMessage("登録の上限数に達しています。");
			return;
		}
		void addTodo(inputText);
		setInputText("");
		setErrorMessage("");
	};

	if (checking || loading) {
		return <div>Loading...</div>;
	}

	if (error) return <div>エラー: {error}</div>;

	return (
		<div className="flex min-h-screen">
			<Sidebar />
			<div className="flex-1 bg-gray-100">
				<Header title="Todo" />
				<main className="p-4 sm:p-6">
					<div className="bg-white p-4 rounded shadow mb-6">
						<div className="text-sm opacity-75 mb-2">
							新しいTodoを追加
						</div>
						<div className="flex gap-2">
							<input
								onChange={(e) => setInputText(e.target.value)}
								onKeyDown={(e) =>
									e.key === "Enter" && handleAdd()
								}
								value={inputText}
								className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
							/>
							<button
								onClick={handleAdd}
								className="bg-slate-800 text-white px-4 py-2 rounded text-sm"
							>
								追加
							</button>
						</div>
					</div>
					<div className="bg-white p-4 rounded shadow mb-6">
						<div className="flex justify-between">
							<div className="text-sm opacity-75 mb-2">
								Todo一覧
							</div>
							<div className="text-sm opacity-50">
								{todos.filter((todo) => todo.isDone).length} /{" "}
								{todos.length} 完了
							</div>
						</div>
						{errorMessage && (
							<div className="text-red-400">
								エラー: {errorMessage}
							</div>
						)}
						<div className="flex flex-col gap-3 py-2 ">
							{todos.map((todo) => (
								<div
									key={todo.id}
									className="flex items-center gap-3 py-2 border-b border-gray-100"
								>
									<input
										type="checkbox"
										className="w-4 h-4"
										checked={todo.isDone}
										onChange={() => toggleTodo(todo.id)}
									/>
									<div
										className={`flex-1 text-sm ${todo.isDone ? "line-through opacity-50" : ""}`}
									>
										{todo.text}
									</div>
									<button
										onClick={() => deleteTodo(todo.id)}
										className="text-sm text-red-400"
									>
										削除
									</button>
								</div>
							))}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

export default TodoPage;
