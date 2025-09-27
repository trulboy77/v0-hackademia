"use client"

import { useTranslations } from "next-intl"

export function SkipLink() {
  const t = useTranslations("accessibility")

  return (
    <a
      href="#main-content"
      className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      aria-label={t("skipToMainContent")}
    >
      {t("skipToMainContent")}
    </a>
  )
}
