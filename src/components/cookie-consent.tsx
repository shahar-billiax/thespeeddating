"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const t = useTranslations();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setShow(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  }

  function decline() {
    localStorage.setItem("cookie-consent", "essential-only");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t p-4 shadow-lg">
      <div className="container max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {t("cookie.message")}{" "}
          <a href="/privacy" className="underline">
            {t("cookie.learn_more")}
          </a>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={decline}>
            {t("cookie.essential_only")}
          </Button>
          <Button size="sm" onClick={accept}>
            {t("cookie.accept_all")}
          </Button>
        </div>
      </div>
    </div>
  );
}
