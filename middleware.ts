import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verificarToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await verificarToken(token);
  const isLogin = pathname === "/login";

  // No autenticado → solo puede ver /login
  if (!user) {
    if (isLogin) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Autenticado → /login y / redirigen al dashboard
  if (isLogin || pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
