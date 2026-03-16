"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full bg-slate-800 p-6 text-white md:w-64 md:shrink-0">
      <div className="mb-6">ロゴ pomo-dashboard</div>

      <div>
        <Link
          href="/main"
          className={`mb-2 block ${pathname === "/main" ? "rounded bg-slate-900 p-2 font-bold" : ""}`}
        >
          ダッシュボード
        </Link>
        <Link
          href="/timer"
          className={`mb-2 block ${pathname === "/timer" ? "rounded bg-slate-900 p-2 font-bold" : ""}`}
        >
          ポモドーロ
        </Link>
        <Link
          href="/todo"
          className={`mb-2 block ${pathname === "/todo" ? "rounded bg-slate-900 p-2 font-bold" : ""}`}
        >
          ToDo
        </Link>
        <Link
          href="/settings"
          className={`mb-2 block ${pathname === "/settings" ? "rounded bg-slate-900 p-2 font-bold" : ""}`}
        >
          設定
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
