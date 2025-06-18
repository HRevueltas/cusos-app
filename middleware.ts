import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Obtener el token y la ruta
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Rutas protegidas por rol
    if (pathname.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (pathname.startsWith("/dashboard/instructor") && token?.role !== "INSTRUCTOR") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }    if (pathname.startsWith("/dashboard/student") && token?.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Proteger rutas de aprendizaje - solo para usuarios autenticados
    if (pathname.startsWith("/learn") && !token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Redireccionar al dashboard apropiado según el rol
    if (pathname === "/dashboard") {
      switch (token?.role) {
        case "ADMIN":
          return NextResponse.redirect(new URL("/dashboard/admin", req.url))
        case "INSTRUCTOR":
          return NextResponse.redirect(new URL("/dashboard/instructor", req.url))
        case "STUDENT":
          return NextResponse.redirect(new URL("/dashboard/student", req.url))
        default:
          return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname        // Permitir rutas públicas
        if (
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/courses") ||
          pathname === "/" ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/_next") ||
          pathname.startsWith("/favicon")
        ) {
          return true
        }

        // Las rutas de aprendizaje requieren autenticación
        if (pathname.startsWith("/learn")) {
          return !!token
        }

        // Requerir autenticación para rutas protegidas
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
