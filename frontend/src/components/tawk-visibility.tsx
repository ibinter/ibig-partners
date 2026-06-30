"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type TawkApi = {
  hideWidget?: () => void;
  showWidget?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
  }
}

export function TawkVisibility() {
  const pathname = usePathname();

  useEffect(() => {
    const isInternal = pathname.startsWith("/espace") || pathname.startsWith("/admin");
    document.documentElement.classList.toggle("internal-app", isInternal);

    let attempts = 0;
    const applyVisibility = () => {
      attempts += 1;
      const api = window.Tawk_API;
      if (isInternal && typeof api?.hideWidget === "function") {
        api.hideWidget();
        return true;
      }
      if (!isInternal && typeof api?.showWidget === "function") {
        api.showWidget();
        return true;
      }
      return false;
    };

    if (applyVisibility()) return;
    const timer = window.setInterval(() => {
      if (applyVisibility() || attempts >= 80) window.clearInterval(timer);
    }, 250);

    return () => window.clearInterval(timer);
  }, [pathname]);

  return null;
}
