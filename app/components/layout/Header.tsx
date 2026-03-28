"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

function Header({ title }: { title: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
      <h1 className="text-3xl font-bold">{title}</h1>
      <button
        onClick={handleLogout}
        className="text-sm text-gray-500 hover:text-gray-800 hover:underline"
      >
        ログアウト
      </button>
    </header>
  );
}

export default Header;
