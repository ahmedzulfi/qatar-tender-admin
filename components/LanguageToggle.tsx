"use client";

import React from "react";
import { useLanguage } from "./LanguageProvider";
import { useTranslation } from "../lib/hooks/useTranslation";
import { Button } from "./ui/button";

export function LanguageToggle() {
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <Button
      onClick={() => changeLanguage(language === "en" ? "ar" : "en")}
      className="px-4 py-2 border rounded"
    >
      {language === "en" ? "عربي" : "English"}
    </Button>
  );
}
