"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

function Header({ title }: { title: string }) {
	const router = useRouter();
	const [userName, setUserName] = useState<string>("");

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push("/signin");
	};

	useEffect(() => {
		const fetchUserName = async () => {
			const {
				data: { session },
				error: sessionError,
			} = await supabase.auth.getSession();
			if (sessionError) {
				return;
			}
			if (!session) return;

			setUserName(session.user.user_metadata?.username ?? "ゲスト");
		};
		void fetchUserName();
	}, []);

	return (
		<header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
			<h1 className="text-3xl font-bold">{title}</h1>
			<div>
				<div>name:{userName}</div>
				<button
					onClick={handleLogout}
					className="text-sm text-gray-500 hover:text-gray-800 hover:underline"
				>
					ログアウト
				</button>
			</div>
		</header>
	);
}

export default Header;
