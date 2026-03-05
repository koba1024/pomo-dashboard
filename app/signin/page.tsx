"use client";

import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  return (
    <div>
      <h1>Signin</h1>
      <button onClick={() => router.push("/main")}>ゲストモード</button>
    </div>
  );
}
