const MP_BASE = "https://api.mercadopago.com"

function accessToken() {
  const t = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!t) throw new Error("MERCADOPAGO_ACCESS_TOKEN no configurado")
  return t
}

const USD_TO_CLP = 950 // Approximate exchange rate

export const MP_PRICES = {
  monthly: Number(process.env.MP_MONTHLY_PRICE ?? Math.round(15 * USD_TO_CLP)),
  annual: Number(process.env.MP_ANNUAL_PRICE ?? Math.round(126 * USD_TO_CLP)),
}

export const MP_CURRENCY = process.env.MP_CURRENCY ?? "CLP"

/** Creates an automatic recurring subscription (Preapproval API). */
export async function createPreapproval(
  plan: "monthly" | "annual",
  academyId: string,
  payerEmail: string,
) {
  const isAnnual = plan === "annual"
  const amount = MP_PRICES[plan]
  const appUrl = (process.env.NEXT_PUBLIC_URL ?? "https://metrikas.pro").replace(/\/$/, "")

  const body = {
    reason: isAnnual
      ? "Metrikas Pro — Plan Anual (12 meses)"
      : "Metrikas Pro — Plan Mensual",
    auto_recurring: {
      frequency: isAnnual ? 12 : 1,
      frequency_type: "months",
      transaction_amount: amount,
      currency_id: MP_CURRENCY,
    },
    back_url: `${appUrl}/subscribe/success?plan=${plan}&academy=${academyId}`,
    payer_email: payerEmail,
    external_reference: `${academyId}::${plan}`,
    notification_url: `${appUrl}/api/webhooks/mercadopago`,
    status: "pending",
  }

  const res = await fetch(`${MP_BASE}/preapproval`, {
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
    status: string
  }>
}

export async function getPreapproval(preapprovalId: string) {
  const res = await fetch(`${MP_BASE}/preapproval/${preapprovalId}`, {
    headers: { Authorization: `Bearer ${accessToken()}` },
  })
  return res.json()
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
  if (status === "suspended" || status === "canceled" || status === "cancelled") return true

  const now = new Date()
  const cutoff = (dateStr: string) => {
    const d = new Date(dateStr)
    d.setDate(d.getDate() + graceDays)
    return d < now
  }

  if (status === "trialing") {
    return trialEnd ? cutoff(trialEnd) : false
  }
  if (status === "active" || status === "past_due" || status === "authorized") {
    return periodEnd ? cutoff(periodEnd) : false
  }
  return false
}
