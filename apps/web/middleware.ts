import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const COOKIE_NAME = "NEXT_LOCALE";

function getLocale(request: NextRequest): string {
  // 1. Cookie
  const cookie = request.cookies.get(COOKIE_NAME);
  if (cookie && routing.locales.includes(cookie.value as never)) {
    return cookie.value;
  }

  // 2. Accept-Language header
  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const langs = acceptLang
      .split(",")
      .map((s) => s.split(";")[0].trim().slice(0, 2).toLowerCase());
    for (const lang of langs) {
      if (routing.locales.includes(lang as never)) return lang;
    }
  }

  // 3. Default
  return routing.defaultLocale;
}

export default function middleware(request: NextRequest) {
  const locale = getLocale(request);
  const response = NextResponse.next();

  // Persist locale in cookie
  response.cookies.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
