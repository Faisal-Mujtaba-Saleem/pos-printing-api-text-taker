import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ✅ Step 1: Define public routes (no login required)
const isPublicRoute = createRouteMatcher([
  "/",               // home page (optional)
  "/sign-in(.*)",    // all sign-in steps
  "/sign-up(.*)",    // all sign-up steps
]);

// ✅ Step 2: Middleware logic
export default clerkMiddleware(
  async (auth, req) => {
    const { userId } = await auth();
    const requestedUrl = req.nextUrl;

    // If the current route is NOT public, protect it
    if (!isPublicRoute(req) && !userId) {
      const redirectUrl = new URL('/sign-in', req.url);
      redirectUrl.searchParams.set('redirect_url', requestedUrl.pathname);

      // ⚡️ Direct, clean redirect — no blank screen
      NextResponse.redirect(redirectUrl)
    }

    if (req.nextUrl.pathname.startsWith("/api") && !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Otherwise allow through immediately
    return NextResponse.next();
  }
);

// ✅ Step 3: Apply middleware to all app routes except static assets
export const config = {
  matcher: [
    // Skip _next/static files, images, etc.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
// Learn more: https://clerk.com/docs/nextjs/middleware