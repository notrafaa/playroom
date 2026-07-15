"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig, isDemoMode } from "@/lib/env";

export function JoinForm({ initialCode = "" }: { initialCode?: string }) {
  const router = useRouter(); const [error, setError] = useState("");
  async function submit(formData: FormData) {
    const code = String(formData.get("code")).trim().toUpperCase();
    if (isDemoMode) return router.push(`/lobby/${code || "DEMO1"}`);
    if (!hasSupabaseConfig) return setError("Supabase n’est pas configuré.");
    const { data, error: rpcError } = await createClient().rpc("join_lobby_by_code", { p_code: code });
    if (rpcError) return setError(rpcError.message);
    router.push(`/lobby/${String(data)}`);
  }
  return <form className="join-form" action={submit}><label className="field"><span>Code à cinq caractères</span><input name="code" defaultValue={initialCode} maxLength={5} required placeholder="K4J8Q" /></label><button className="button button-primary">Rejoindre</button>{error && <p className="notice">{error}</p>}</form>;
}
