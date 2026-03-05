"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SignIn() {
  const router = useRouter();

  const handleGuest = async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      alert(error.message);
      return;
    }

    router.push("/main");
  };

  return (
    <div>
      <h1>Signin</h1>
      <button onClick={handleGuest}>ゲストモード</button>
    </div>
  );
}
