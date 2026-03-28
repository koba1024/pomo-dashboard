"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";

export default function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessages, setErrorMessages] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	const setUnknownError = (error: unknown) => {
		setErrorMessages([
			error instanceof Error
				? error.message
				: "予期しないエラーが発生しました",
		]);
	};

	const validateRequiredFields = () => {
		const messages: string[] = [];

		if (!email.trim()) {
			messages.push("メールアドレスを入力してください");
		}
		if (!password) {
			messages.push("パスワードを入力してください");
		}

		return messages;
	};

	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (isSubmitting) return;

		try {
			setIsSubmitting(true);

			const validationErrors = validateRequiredFields();
			if (validationErrors.length > 0) {
				setErrorMessages(validationErrors);
				return;
			}

			setErrorMessages([]);

			const { error } = await supabase.auth.signInWithPassword({
				email: email.trim(),
				password,
			});

			if (error) {
				setErrorMessages([error.message]);
				return;
			}

			router.push("/main");
		} catch (error) {
			setUnknownError(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGuest = async () => {
		if (isSubmitting) return;

		try {
			setIsSubmitting(true);
			setErrorMessages([]);

			const { error } = await supabase.auth.signInAnonymously();

			if (error) {
				setErrorMessages([error.message]);
				return;
			}

			router.push("/main");
		} catch (error) {
			setUnknownError(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 px-4 py-10 sm:px-6 lg:px-8">
			<div className="flex flex-col items-center">
				<h2 className="text-3xl font-extrabold text-gray-900">
					pomo-dashboard
				</h2>

				<div className="mt-8 w-full max-w-md">
					<div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
						<form onSubmit={handleLogin}>
							<div className="space-y-6">
								<div>
									<label
										className="block text-sm font-medium text-gray-700"
										htmlFor="email"
									>
										メールアドレス
									</label>
									<div className="mt-1">
										<input
											id="email"
											name="email"
											type="email"
											placeholder="メールアドレス"
											value={email}
											onChange={(e) =>
												setEmail(e.target.value)
											}
											required
											className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
										/>
									</div>
								</div>

								<div>
									<label
										className="block text-sm font-medium text-gray-700"
										htmlFor="password"
									>
										パスワード
									</label>
									<div className="mt-1">
										<input
											id="password"
											name="password"
											type="password"
											placeholder="パスワード"
											value={password}
											onChange={(e) =>
												setPassword(e.target.value)
											}
											required
											className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
										/>
									</div>
								</div>

								{errorMessages.length > 0 && (
									<ul className="mt-2 text-sm text-red-500">
										{errorMessages.map((msg, index) => (
											<li key={`${index}-${msg}`}>
												{msg}
											</li>
										))}
									</ul>
								)}

								<div>
									<button
										type="submit"
										disabled={isSubmitting}
										className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									>
										{isSubmitting
											? "ログイン中..."
											: "ログイン"}
									</button>
								</div>

								<div className="flex items-center gap-3">
									<div className="h-px flex-1 bg-gray-300" />
									<p className="text-sm text-gray-500">
										または
									</p>
									<div className="h-px flex-1 bg-gray-300" />
								</div>

								<div>
									<button
										type="button"
										onClick={handleGuest}
										disabled={isSubmitting}
										className="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									>
										ゲストアカウントでログイン
									</button>
								</div>

								<div>
									<button
										type="button"
										onClick={() => router.push("/signup")}
										className="flex w-full justify-center text-sm text-sky-600 hover:text-sky-700 hover:underline"
									>
										新規登録はこちら
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
