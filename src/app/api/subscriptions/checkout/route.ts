import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createPreapproval } from "@/lib/mercadopago"

export async function POST(req: NextRequest) {
  try {
    const { plan } = await req.json()

    if (!["monthly", "annual"].includes(plan)) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => (cookieStore as any).getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // The academy being paid for is the caller's own, read from their profile —
    // never from the request. It used to come from the body, which meant the
    // value that ends up in MercadoPago's external_reference (and is split on
    // "::" by the webhook) was chosen by the caller: it could point at someone
    // else's academy, or carry a smuggled "::annual" to pick the plan length.
    const { data: profile } = await supabase
      .from("profiles").select("academy_id, role").eq("id", user.id).maybeSingle()
    if (!profile?.academy_id || profile.role !== "coach") {
      return NextResponse.json({ error: "Solo el entrenador puede activar la suscripción." }, { status: 403 })
    }

    const preapproval = await createPreapproval(plan, profile.academy_id, user.email)

    return NextResponse.json({
      checkout_url: preapproval.init_point,
      preapproval_id: preapproval.id,
    })
  } catch (e: any) {
    console.error("checkout error:", e)
    return NextResponse.json({ error: e.message ?? "Error al crear el pago" }, { status: 500 })
  }
}
