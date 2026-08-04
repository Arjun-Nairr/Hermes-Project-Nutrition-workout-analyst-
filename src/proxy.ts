import { NextRequest, NextResponse } from "next/server";
import { hashPassword, SESSION_COOKIE } from "@/lib/auth";

export default async function proxy(req: NextRequest) {
  const session = req.cookies.get(SESSION_COOKIE)?.value;
  const expected = await hashPassword(process.env.SITE_PASSWORD ?? "");

  if (session === expected) return NextResponse.next();

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

// api/mcp is excluded — it's for Hermes (no browser session), gated by its own
// shared-secret check in the route handler instead.
export const config = {
  matcher: ["/((?!login|api/mcp|_next/static|_next/image|favicon.ico).*)"],
};
