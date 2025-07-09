import { clerkMiddleware } from "@clerk/nextjs/server"

export default clerkMiddleware()

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)", // This applies to all routes except static files and _next
    "/",                      // Homepage
    "/(api|trpc)(.*)"         // API routes
  ]
}
