import { NextResponse, type NextRequest } from "next/server";

// The admin dashboard lives on its own web address (e.g. admin.medicotohome.in) when ADMIN_HOST is set.
// Without it, as in local development, /admin stays reachable on the main site.
const ADMIN_HOST = process.env.ADMIN_HOST?.toLowerCase();

export function proxy(request: NextRequest) {
  if (!ADMIN_HOST) return NextResponse.next();
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const { pathname } = request.nextUrl;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  if (host === ADMIN_HOST) {
    if (isAdminPath) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }
  // On the public site the admin pages do not exist.
  if (isAdminPath) return new NextResponse("Not found", { status: 404 });
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|brand/|img/|favicon).*)"],
};
