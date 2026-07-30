import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "info@metrikas.pro",
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    return await transporter.sendMail({
      from: `Metrikas <${process.env.SMTP_USER || "info@metrikas.pro"}>`,
      to,
      subject,
      html,
    })
  } catch (err) {
    console.error("Email error:", err)
    throw err
  }
}

export function trialReminderEmail(academyName: string, daysLeft: number): string {
  if (daysLeft === 4) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>¡Tu período de prueba vence pronto! 🎯</h2>
        <p>Hola,</p>
        <p>Tu academia <strong>${academyName}</strong> tiene acceso gratuito a Metrikas por solo <strong>4 días más</strong>.</p>
        <p>Para continuar usando Metrikas después del período de prueba, necesitas activar tu suscripción.</p>
        <a href="https://metrikas.pro/subscribe" style="display: inline-block; background: #0B5CFF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
          Activar suscripción ahora
        </a>
        <p style="color: #666; font-size: 14px;">Si tienes dudas, responde este email o contáctanos por WhatsApp.</p>
      </div>
    `
  }

  if (daysLeft === 0) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Tu período de prueba terminó ⏰</h2>
        <p>Hola,</p>
        <p>Tu academia <strong>${academyName}</strong> completó los 14 días de prueba gratuita.</p>
        <p>Para continuar usando Metrikas, activa tu suscripción ahora.</p>
        <a href="https://metrikas.pro/subscribe" style="display: inline-block; background: #0B5CFF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
          Activar suscripción
        </a>
        <p style="color: #666; font-size: 14px;">Sin suscripción, tu cuenta se eliminará en 30 días.</p>
      </div>
    `
  }

  if (daysLeft === -10) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>⚠️ Última oportunidad: Tu cuenta se elimina en 20 días</h2>
        <p>Hola,</p>
        <p>Tu academia <strong>${academyName}</strong> se elimará en <strong>20 días</strong> si no activas una suscripción.</p>
        <p><strong>Todos tus datos (jugadores, evaluaciones, actividades) se borrarán permanentemente.</strong></p>
        <a href="https://metrikas.pro/subscribe" style="display: inline-block; background: #DC2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
          Guardar mi academia ahora
        </a>
        <p style="color: #666; font-size: 14px;">Responde este email si necesitas ayuda.</p>
      </div>
    `
  }

  return ""
}

export function accountDeletedEmail(academyName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Tu cuenta en Metrikas ha sido eliminada</h2>
      <p>Hola,</p>
      <p>Lamentamos informarte que tu academia <strong>${academyName}</strong> ha sido eliminada de Metrikas.</p>
      <p><strong>Razón:</strong> No se activó una suscripción después del período de prueba.</p>
      <p>Todos tus datos se han borrado permanentemente.</p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">Si deseas volver a usar Metrikas, puedes crear una nueva cuenta en <strong>https://metrikas.pro</strong></p>
    </div>
  `
}
