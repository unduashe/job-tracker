import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/**
 * Intercambia el `code` del enlace de recuperación por una sesión y redirige a restablecer contraseña.
 */
export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code");

    const redirectWithLoginError = (reason: string) => {
        const url = new URL("/login", request.url);
        url.searchParams.set("error", reason);
        return NextResponse.redirect(url);
    };

    if (!code) {
        return redirectWithLoginError("missing_code");
    }

    let response = NextResponse.redirect(new URL("/reset-password", request.url));

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (cookiesToSet) => {
                cookiesToSet.forEach(({ name, value }) => {
                    request.cookies.set(name, value);
                });
                response = NextResponse.redirect(new URL("/reset-password", request.url));
                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, options);
                });
            },
        },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("exchangeCodeForSession:", error);

        const url = new URL("/login", request.url);
        url.searchParams.set("error", error.message || "exchange_failed");
        return NextResponse.redirect(url);
    }

    return response;
}
