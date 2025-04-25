"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;
    const hasToken = hash.includes("access_token");

    if (hasToken) {
      const queryParams = new URLSearchParams(hash.slice(1)); // remove '#' first
      const access_token = queryParams.get("access_token");
      const refresh_token = queryParams.get("refresh_token");

      if (access_token && refresh_token) {
        // Store the session manually
        supabase.auth
          .setSession({
            access_token,
            refresh_token,
          })
          .then(({ data, error }) => {
            if (!error) {
              router.replace("/dashboard"); // ✅ redirect after successful login
            } else {
              console.error("Session error:", error);
            }
          });
      }
    }
  }, [router]);

  return <p>Redirecting...</p>;
}
