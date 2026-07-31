import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { academyName, coachName, language, code } = await req.json()

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    console.log("Testing RPC with params:", { academyName, coachName, language, code })

    const { data, error } = await admin.rpc("crear_academia_con_código", {
      p_name: academyName,
      p_coach_name: coachName,
      p_language: language,
      p_code: code,
    })

    console.log("RPC response:", { data, error })

    if (error) {
      return NextResponse.json({
        ok: false,
        error: error.message,
        details: error,
      })
    }

    return NextResponse.json({
      ok: true,
      data,
    })
  } catch (err) {
    console.error("Debug error:", err)
    return NextResponse.json({
      ok: false,
      error: String(err),
    })
  }
}
