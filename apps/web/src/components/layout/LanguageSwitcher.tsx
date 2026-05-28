"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const switchLanguage = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  };

  return (
    <>
      {locale !== "zh" && (
        <DropdownMenuItem onClick={() => switchLanguage("zh")}>
          中文
        </DropdownMenuItem>
      )}
      {locale !== "en" && (
        <DropdownMenuItem onClick={() => switchLanguage("en")}>
          English
        </DropdownMenuItem>
      )}
    </>
  );
}
