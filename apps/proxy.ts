import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

type Locale = (typeof routing.locales)[number];

const countryToLocale: Record<string, Locale> = {
  FR: "fr",
  EN: "en",
  ES: "es",
  DE: "de",
};

function getCountryFromRequest(request: NextRequest): string | null {
  const cloudflareCountry = request.headers.get("cf-ipcountry");
  const vercelCountry = request.headers.get("x-vercel-ip-country");
  const fastlyCountry = request.headers.get("x-fastly-geo-country");
  return cloudflareCountry || vercelCountry || fastlyCountry || null;
}

function getLocaleFromCountry(country: string | null): Locale {
  if (country && country in countryToLocale) {
    return countryToLocale[country];
  }
  return routing.defaultLocale;
}

function isValidLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}

const AUTH_PATHS = ["/login", "/register"];
const PROTECTED_PATHS = ["/dashboard", "/user"];
const REFRESH_COOKIE_NAME = process.env.AUTH_REFRESH_COOKIE_NAME ?? "aether_meet_refresh";
const PLATFORM_PATHS = [
  "/contacts",
  "/dashboard",
  "/documents",
  "/home",
  "/projects",
  "/resources",
  "/tasks",
  "/calendar",
  "/calls",
  "/chat",
  "/drive",
  "/notifications",
  "/settings",
  "/teams",
];
const NO_LOCALE_PATHS = ["/pgp", "/discord", "/dashboard", "/user", ...PLATFORM_PATHS];

function isPlatformPath(pathname: string): boolean {
  return PLATFORM_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function isLocalDevelopment(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== "development") {
    return false;
  }

  const hostname = request.nextUrl.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function isValidJWT(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  return parts.length === 3;
}

function hasSessionCookie(request: NextRequest): boolean {
  return Boolean(request.cookies.get(REFRESH_COOKIE_NAME)?.value);
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (isLocalDevelopment(request) && isPlatformPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/" || pathname === "") {
    const country = getCountryFromRequest(request);
    const locale = getLocaleFromCountry(country);
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  const isAuthPath = AUTH_PATHS.some((p) => pathname === p || pathname === `/${firstSegment}${p}`);
  if (isAuthPath) {
    const cleanPath = AUTH_PATHS.find((p) => pathname.endsWith(p));
    if (pathname !== cleanPath) {
      return NextResponse.redirect(new URL(cleanPath!, request.url));
    }
    return NextResponse.next();
  }

  const isProtectedPath = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (isProtectedPath) {
    const authCookie = request.cookies.get("auth_token");
    const isValid = isValidJWT(authCookie?.value) || hasSessionCookie(request);
    if (!isValid) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isPlatformPath(pathname) && !hasSessionCookie(request) && !isLocalDevelopment(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (firstSegment && isValidLocale(firstSegment)) {
    const localePath = `/${firstSegment}`;
    const isNoLocalePath = NO_LOCALE_PATHS.some(
      (p) => pathname.startsWith(localePath + p) || pathname === localePath + p
    );
    if (isNoLocalePath) {
      const cleanPath = pathname.replace(localePath, "");
      return NextResponse.redirect(new URL(cleanPath || "/", request.url));
    }
    return NextResponse.next();
  }

  if (firstSegment && !isValidLocale(firstSegment)) {
    const isNoLocalePath = NO_LOCALE_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );
    if (isNoLocalePath) {
      return NextResponse.next();
    }
    const country = getCountryFromRequest(request);
    const locale = getLocaleFromCountry(country);
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|health).*)"],
};
