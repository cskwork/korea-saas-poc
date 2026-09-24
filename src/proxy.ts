import { NextResponse, type NextRequest } from "next/server";
import { WORKSPACE_COOKIE, WORKSPACE_COOKIE_MAX_AGE, isWorkspaceId } from "@/core/workspace/constants";

/**
 * Gives every visitor a workspace (anonymous tenant) on their first request.
 * The id is also written onto the forwarded request so the very first render
 * already sees it.
 */
export function proxy(request: NextRequest) {
  if (isWorkspaceId(request.cookies.get(WORKSPACE_COOKIE)?.value)) return NextResponse.next();

  const workspaceId = crypto.randomUUID();
  request.cookies.set(WORKSPACE_COOKIE, workspaceId);

  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set({
    name: WORKSPACE_COOKIE,
    value: workspaceId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WORKSPACE_COOKIE_MAX_AGE,
  });
  return response;
}

export const config = {
  // Pages and server actions only: skip static assets, images, API and metadata files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff2?)$).*)"],
};
