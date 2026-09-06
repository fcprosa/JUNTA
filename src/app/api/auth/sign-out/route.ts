import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return Response.redirect(new URL("/", request.url), 303);
  } catch (error) {
    console.error("Falha segura ao terminar sessão.", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return Response.redirect(new URL("/auth/erro", request.url), 303);
  }
}
