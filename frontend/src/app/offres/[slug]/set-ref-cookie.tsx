"use client";

import { useEffect } from "react";
import { COOKIE_TRACKING_DAYS } from "@/lib/constants";

export function SetRefCookie({ code }: { code: string }) {
  useEffect(() => {
    if (!code) return;
    const maxAge = 60 * 60 * 24 * COOKIE_TRACKING_DAYS;
    document.cookie = `ibig_ref=${code}; max-age=${maxAge}; path=/; samesite=lax`;
  }, [code]);

  return null;
}
