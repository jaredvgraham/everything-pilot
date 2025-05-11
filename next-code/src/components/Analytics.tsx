// components/Analytics.tsx
"use client"; // This directive is necessary to make this a client component

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analytics } from "@/config/firebase";
import { logEvent } from "firebase/analytics";

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      analytics.then((analyticsInstance) => {
        if (analyticsInstance) {
          logEvent(analyticsInstance, "page_view", { page_path: pathname });
        }
      });
    }
  }, [pathname]);

  return null;
}
