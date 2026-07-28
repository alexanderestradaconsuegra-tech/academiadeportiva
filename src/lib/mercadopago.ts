const MP_BASE = "https://api.mercadopago.com"

function accessToken() {
  const t = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!t) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado")
  return t
}

export const MP_PRICES = {
  monthly: Number(process.env.MP_MONTHLY_PRICE ?? 15),
  annual: Number(process.env.MP_ANNUAL_PRICE ?? 126),
}

export const MP_CURRENCY = process.env.MP_CURRENCY ?? "USD"

export async function createCheckoutPreference(plan: "monthly" | "annual", academyId: string) {
  const isAnnual = plan === "annual"
  const amount = MP_PRICES[plan]
  const appUrl = (process.env.NEXT_PUBLIC_URL ?? "https://metrikas.pro").replace(/\/$/, "")

  const body = {
    items: [{
      id: `metrikas-${plan}`,
      title: isAnnual ? "Metrikas — Plan Anual (12 meses)" : "Metrikas — Plan Mensual",
      description: isAnnual
        ? "Acceso completo por 12 meses · Ahorra 30%"
        : "Acceso completo por 1 mes · Renueva manualmente",
      quantity: 1,
      unit_price: amount,
      currency_id: MP_CURRENCY,
    }],
    back_urls: {
      success: `${appUrl}/subscribe/success?plan=${plan}&academy=${academyId}`,
      failure: `${appUrl}/subscribe?error=1`,
      pending: `${appUrl}/subscribe?pending=1`,
    },
    auto_return: "approved",
    external_reference: `${academyId}::${plan}`,
    notification_url: `${appUrl}/api/webhooks/mercadopago`,
    statement_descriptor: "METRIKAS",
    expires: false,
  }

  const res = await fetch(`${MP_BASE}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`MercadoPago error: ${err}`)
  }

  return res.json() as Promise<{
    id: string
    init_point: string
    sandbox_init_point: string
  }>
}

export async function getPayment(paymentId: string | number) {
  const res = await fetch(`${MP_BASE}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
  })
  return res.json()
}

export function periodEndFromPlan(plan: string): Date {
  const d = new Date()
  if (plan === "annual") {
    d.setFullYear(d.getFullYear() + 1)
  } else {
    d.setMonth(d.getMonth() + 1)
  }
  return d
}

export function isSubscriptionBlocked(
  status: string | null | undefined,
  periodEnd: string | null | undefined,
  trialEnd: string | null | undefined,
  graceDays = 5,
): boolean {
  if (!status) return false
  if (status === "suspended" || status === "canceled") return true

  const now = new Date()
  const cutoff = (dateStr: string) => {
    const d = new Date(dateStr)
    d.setDate(d.getDate() + graceDays)
    return d < now
  }

  if (status === "trialing") {
    return trialEnd ? cutoff(trialEnd) : false
  }
  if (status === "active" || status === "past_due") {
    return periodEnd ? cutoff(periodEnd) : false
  }
  return false
}
