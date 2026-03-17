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

	const validateRequiredFields = (): string[] => {
		const messages: string[] = [];

		const trimmedEmail = email.trim();

		if (!trimmedEmail) {
			messages.push("メールアドレスを入力してください");
		}
		if (!password) {
			messages.push("パスワードを入力してください");
		}

		return messages;
	};

	const handleLogin = async () => {
		if (isSubmitting) return;
		const messages: string[] = [];
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
				messages.push(error.message);
				setErrorMessages(messages);
				return;
			}
			router.push("/main");
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessages([error.message]);
			} else {
				setErrorMessages(["予期しないエラーが発生しました"]);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGuest = async () => {
		if (isSubmitting) return;
		const messages: string[] = [];

		try {
			setIsSubmitting(true);
			setErrorMessages([]);
			const { error } = await supabase.auth.signInAnonymously();
			if (error) {
				messages.push(error.message);
				setErrorMessages(messages);
				return;
			}
			router.push("/main");
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessages([error.message]);
			} else {
				setErrorMessages(["予期しないエラーが発生しました"]);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
			<div className="flex flex-col items-center">
				<h2 className="text-3xl font-extrabold text-gray-900">
					pomo-dashboard
				</h2>
				<div className="mt-8 w-full max-w-md">
					<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
										onChange={(e) =>
											setEmail(e.target.value)
										}
										value={email}
										id="email"
										name="email"
										placeholder="メールアドレス"
										required
										type="email"
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
										onChange={(e) =>
											setPassword(e.target.value)
										}
										value={password}
										id="password"
										name="password"
										placeholder="パスワード"
										required
										type="password"
										className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
									/>
								</div>
							</div>
							{errorMessages.length > 0 && (
								<ul className="mt-2 text-sm text-red-500">
									{errorMessages.map((msg, index) => (
										<li key={`${index}-${msg}`}>{msg}</li>
									))}
								</ul>
							)}
							<div>
								<button
									onClick={handleLogin}
									className="w-full flex justify-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									ログイン
								</button>
							</div>

							<div className="flex items-center gap-3">
								<div className="h-px flex-1 bg-gray-300" />
								<p className="text-sm text-gray-500">または</p>
								<div className="h-px flex-1 bg-gray-300" />
							</div>

							<div>
								<button
									className="w-full flex justify-center py-2.5 px-4 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
									onClick={handleGuest}
								>
									ゲストアカウントでログイン
								</button>
							</div>

							<div>
								<button
									className="w-full flex justify-center text-sm text-sky-600 hover:text-sky-700 hover:underline"
									onClick={() => router.push("/signup")}
								>
									新規登録はこちら
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
