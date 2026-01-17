"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations("language");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const changeLanguage = (locale: string) => {
    // Set cookie
    document.cookie = `kvt_lang=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Refresh the page to apply new locale
    router.refresh();
  };

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:text-white/90 hover:bg-brand-700"
          aria-label={t("selectLanguage")}
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => changeLanguage("en")}
          className={currentLocale === "en" ? "bg-accent" : ""}
        >
          <span className="flex items-center gap-2">
            <span>🇬🇧</span>
            <span>{t("english")}</span>
            {currentLocale === "en" && <span className="ml-auto">✓</span>}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("ms")}
          className={currentLocale === "ms" ? "bg-accent" : ""}
        >
          <span className="flex items-center gap-2">
            <span>🇲🇾</span>
            <span>{t("bahasaMelayu")}</span>
            {currentLocale === "ms" && <span className="ml-auto">✓</span>}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
