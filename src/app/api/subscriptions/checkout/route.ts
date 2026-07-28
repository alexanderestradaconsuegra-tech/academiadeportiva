import { NextRequest, NextResponse } from "next/server"
import { createCheckoutPreference } from "@/lib/mercadopago"

export async function POST(req: NextRequest) {
  try {
    const { plan, academy_id } = await req.json()

    if (!["monthly", "annual"].includes(plan)) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 })
    }
    if (!academy_id) {
      return NextResponse.json({ error: "academy_id requerido" }, { status: 400 })
    }

    const preference = await createCheckoutPreference(plan, academy_id)

    const isProd = process.env.NODE_ENV === "production"
    return NextResponse.json({
      checkout_url: isProd ? preference.init_point : preference.sandbox_init_point,
      preference_id: preference.id,
    })
  } catch (e: any) {
    console.error("checkout error:", e)
    return NextResponse.json({ error: e.message ?? "Error al crear el pago" }, { status: 500 })
  }
}
