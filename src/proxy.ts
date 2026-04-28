import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({ request });

    // Actualiza el token recibido de supabase tanto para la petición como para el cliente
    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value);
                    });

                    response = NextResponse.next({ request });

                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // Obtiene el usuario de supabase, si está caducado el token lo intenta actualizar
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    const isRootRoute = path === "/";
    const isResetPasswordRoute = path === "/reset-password";
    const isAuthRoute =
        path === "/login" || path === "/register" || path === "/forgot-password";
    const isProtectedRoute = path.startsWith("/dashboard");

    // Si el usuario no está logado e intenta acceder a una ruta protegida se le redirige a login
    if (!user && isProtectedRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Restablecer contraseña exige sesión (la crea el callback tras el enlace del correo)
    if (!user && isResetPasswordRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Si se accede a la raíz, redirigimos según el estado de sesión
    if (isRootRoute) {
        const destination = user ? "/dashboard" : "/login";
        return NextResponse.redirect(new URL(destination, request.url));
    }

    // Si el usuario está logado y accede a login se le redirige al dashboard del usuario logado
    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
