"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // ✅ Handle URL hash with access token
      const { error } = await supabase.auth.exchangeCodeForSession();

      if (error) {
        console.error("Error exchanging session:", error.message);
        return;
      }

      // ✅ Redirect after successful login
      router.replace("/dashboard");
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Verifying login...</p>
    </div>
  );
}
