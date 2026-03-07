"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const validateRequiredFields = () => {
    const messages: string[] = [];

    const trimmedName = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      if (!trimmedName) {
        messages.push("ユーザー名が入力されていません");
      }
      if (!trimmedEmail) {
        messages.push("メールアドレスが入力されていません");
      }
      if (!trimmedPassword) {
        messages.push("パスワードが入力されていません");
      }
    }
    return messages;
  };

  const handleSignup = async () => {
    setIsSubmitting(true);
    const messages: string[] = [];

    const validationErrors = validateRequiredFields();
    if (validationErrors.length > 0) {
      setErrorMessages(validationErrors);
      setIsSubmitting(false);
      return;
    }
    setErrorMessages([]);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: { username: username.trim() },
      },
    });

    if (error) {
      messages.push(error.message);
      setErrorMessages(messages);
      setIsSubmitting(false);
      return;
    }
    alert("登録が完了しました。サインインしてください");
    router.push("/signin");
    setIsSubmitting(false);
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
                  htmlFor="username"
                >
                  ユーザー名
                </label>
                <div className="mt-1">
                  <input
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    id="username"
                    name="username"
                    placeholder="ユーザー名"
                    required
                    type="text"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="email"
                >
                  メールアドレス
                </label>
                <div className="mt-1">
                  <input
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
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
                  onClick={handleSignup}
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "登録中" : "登録"}
                </button>
              </div>
              <div>
                <button
                  className="w-full flex justify-center text-sm text-sky-600 hover:text-sky-700 hover:underline"
                  onClick={() => router.push("/signin")}
                >
                  すでにアカウントをお持ちの方はこちら
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
