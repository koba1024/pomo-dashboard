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
        setChecking(false);
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
    <div>
      <h1>Main Page</h1>
      <div>checking: {String(checking)}</div>
      <div>userId: {userId ?? "null"}</div>
    </div>
  );
}
