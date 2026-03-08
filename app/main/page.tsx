"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function Main() {
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace("/signin");
        return;
      }
      setUserId(data.user.id);
      setChecking(false);
    };
    run();
  }, [router]);

  if (checking) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-800 text-white p-6">
        <div className="mb-6">ロゴ pomo-dashboard</div>
        <div>
          <div className="mb-2 bg-slate-900 font-bold p-2 rounded">
            ダッシュボード
          </div>
          <div className="mb-2">ポモドーロ</div>
          <div className="mb-2">ToDo</div>
          <div className="mb-2">設定</div>
        </div>
      </aside>
      <div className="flex-1 bg-gray-100">
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold">学習ダッシュボード</h1>
        </header>
        <main className="flex-1 bg-gray-100 p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow ">
              <div className="text-sm opacity-75">今日のポモドーロ</div>
              <div className="text-3xl">0回</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm opacity-75">今日の作業時間</div>
              <div className="text-3xl">0分</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm opacity-75">今週の作業時間</div>
              <div className="text-3xl">0分</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm opacity-75">今月の作業時間</div>
              <div className="text-3xl">0分</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm opacity-75">作業時間グラフ</div>
              <div className="text-3xl">グラフがくる</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-sm opacity-75">連続日数</div>
              <div className="text-3xl">0日</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <div className="text-xs opacity-75 mb-1">最近のセッション</div>
              <div className="text-sm mb-1">セッション1</div>
              <div className="text-sm mb-1">セッション2</div>
              <div className="text-sm mb-1">セッション3</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-xs opacity-75 mb-1">未完了のTodo</div>
              <div className="text-sm mb-1">Todo1</div>
              <div className="text-sm mb-1">Todo2</div>
              <div className="text-sm mb-1">Todo3</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
