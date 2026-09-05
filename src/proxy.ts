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
    const isProfileRoute = path === "/dashboard/profile";
    const isAuthRoute =
        path === "/login" || path === "/register" || path === "/forgot-password";

    // Restablecer contraseña exige sesión (la crea el callback tras el enlace del correo)
    if (!user && isResetPasswordRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Perfil solo accesible para usuarios autenticados
    if (!user && isProfileRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // La raíz redirige siempre al dashboard.
    // En modo invitado el dashboard funciona sin sesión gracias al modo "guest".
    if (isRootRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Si el usuario está logado y accede a una ruta de auth se le redirige al dashboard
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
