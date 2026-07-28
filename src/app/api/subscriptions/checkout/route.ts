import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createPreapproval } from "@/lib/mercadopago"

export async function POST(req: NextRequest) {
  try {
    const { plan, academy_id } = await req.json()

    if (!["monthly", "annual"].includes(plan)) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 })
    }
    if (!academy_id) {
      return NextResponse.json({ error: "academy_id requerido" }, { status: 400 })
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

    const preapproval = await createPreapproval(plan, academy_id, user.email)

    return NextResponse.json({
      checkout_url: preapproval.init_point,
      preapproval_id: preapproval.id,
    })
  } catch (e: any) {
    console.error("checkout error:", e)
    return NextResponse.json({ error: e.message ?? "Error al crear el pago" }, { status: 500 })
  }
}
