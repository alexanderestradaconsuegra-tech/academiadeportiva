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
        <a href="https://metrikas.pro/subscribe" style="display: inline-block; background: #a3e635; color: #05122F; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
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
        <a href="https://metrikas.pro/subscribe" style="display: inline-block; background: #a3e635; color: #05122F; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
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

export function demoReminderEmail(academyName: string, code: string, daysLeft: number): string {
  const appUrl = (process.env.NEXT_PUBLIC_URL ?? "https://app.metrikas.pro").replace(/\/$/, "")
  const urgent = daysLeft <= 1

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #a3e635 0%, #84cc16 100%); padding: 2px; border-radius: 12px;">
      <div style="background: white; padding: 40px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #05122F; margin: 0; font-size: 26px;">${urgent ? "⏱️ Tu demo vence mañana" : "👋 ¿Ya probaste Metrikas?"}</h1>
        </div>

        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Hola,<br><br>
          Vimos que solicitaste una demo para <strong>${academyName}</strong> pero todavía no la has activado.
          ${urgent
            ? "Tu código vence <strong>mañana</strong> — actívalo hoy para no perder tus 14 días gratis."
            : "Todavía te quedan <strong>" + daysLeft + " días</strong> para probar todo lo que Metrikas puede hacer por tu academia."}
        </p>

        <div style="background: #05122F; color: #a3e635; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; border: 2px solid #a3e635;">
          <p style="margin: 0 0 10px 0; font-size: 12px; color: #a3e635;">TU CÓDIGO DE DEMO</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px; color: #a3e635;">${code}</p>
        </div>

        <p style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/login" style="display: inline-block; background: #a3e635; color: #05122F; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            👉 Activar mi demo ahora
          </a>
        </p>

        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          ¿Tienes dudas o necesitas ayuda para empezar? Escríbenos por WhatsApp: <a href="https://wa.me/56992103974" style="color: #a3e635; text-decoration: none;">+56 9 9210 3974</a>
        </p>
      </div>
    </div>
  `
}

export function newAcademyCredentialsEmail(academyName: string, email: string, password: string): string {
  const appUrl = (process.env.NEXT_PUBLIC_URL ?? "https://app.metrikas.pro").replace(/\/$/, "")

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #a3e635 0%, #84cc16 100%); padding: 2px; border-radius: 12px;">
      <div style="background: white; padding: 40px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #05122F; margin: 0; font-size: 26px;">🎉 ¡Tu academia ya está lista!</h1>
        </div>

        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Hola,<br><br>
          Recibimos tu pago y creamos tu cuenta en Metrikas para <strong>${academyName}</strong>. Ya puedes entrar con estos datos:
        </p>

        <div style="background: #05122F; color: #a3e635; padding: 20px; border-radius: 8px; margin: 30px 0; border: 2px solid #a3e635;">
          <p style="margin: 0 0 4px 0; font-size: 11px; color: #a3e635; text-transform: uppercase; letter-spacing: 1px;">Usuario</p>
          <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: bold; color: #fff;">${email}</p>
          <p style="margin: 0 0 4px 0; font-size: 11px; color: #a3e635; text-transform: uppercase; letter-spacing: 1px;">Contraseña</p>
          <p style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 1px; color: #fff;">${password}</p>
        </div>

        <div style="background: #f0fdf4; border-left: 4px solid #a3e635; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #166534; font-size: 14px;">
            <strong>💡 Recomendación:</strong> una vez dentro, ve a Configuración y cambia esta contraseña por una que solo tú conozcas.
          </p>
        </div>

        <p style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/login" style="display: inline-block; background: #a3e635; color: #05122F; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            👉 Entrar a Metrikas
          </a>
        </p>

        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          ¿Tienes dudas o necesitas ayuda para empezar? Escríbenos por WhatsApp: <a href="https://wa.me/56992103974" style="color: #a3e635; text-decoration: none;">+56 9 9210 3974</a>
        </p>
      </div>
    </div>
  `
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
