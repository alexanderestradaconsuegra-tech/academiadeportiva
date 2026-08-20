import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos y Condiciones — Metrikas",
  description: "Condiciones de uso del servicio Metrikas para academias de fútbol.",
}

const h2 = "text-xl font-black text-slate-900 dark:text-white mt-10 mb-3 first:mt-0"
const p = "text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-3"
const ul = "list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-3"

export default function TermsPage() {
  return (
    <article>
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">Legal</p>
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">Términos y Condiciones</h1>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Última actualización: 5 de agosto de 2026</p>

      <p className={p}>
        Estos Términos y Condiciones ("Términos") regulan el uso de <strong>Metrikas</strong> (la "Plataforma"),
        desarrollada y operada por <strong>Autix</strong> ("Autix", "nosotros"). Al crear una cuenta, acceder o usar
        la Plataforma, aceptas estos Términos en su totalidad. Si no estás de acuerdo, no debes usar Metrikas.
      </p>

      <h2 className={h2}>1. Descripción del servicio</h2>
      <p className={p}>
        Metrikas es una plataforma de software como servicio (SaaS) para la gestión de academias de fútbol:
        jugadores y categorías, convocatorias y formaciones, entrenamientos y asistencia, evaluaciones y
        seguimiento físico, notificaciones y cobro de mensualidades. Metrikas es una herramienta de gestión
        deportiva y no constituye un servicio médico, diagnóstico ni asesoría clínica.
      </p>

      <h2 className={h2}>2. Cuentas y roles</h2>
      <p className={p}>
        Cada academia contrata la Plataforma como cliente independiente. El administrador de la academia crea los
        accesos de profesores y jugadores, y es responsable de:
      </p>
      <ul className={ul}>
        <li>La veracidad de los datos que ingresa o autoriza ingresar a la Plataforma.</li>
        <li>Contar con las autorizaciones necesarias de padres, madres o apoderados antes de registrar a jugadores
          menores de edad.</li>
        <li>Administrar quién tiene acceso a cada categoría y a la información de pagos.</li>
        <li>Mantener la confidencialidad de las credenciales de sus usuarios.</li>
      </ul>

      <h2 className={h2}>3. Uso aceptable</h2>
      <p className={p}>No está permitido usar Metrikas para:</p>
      <ul className={ul}>
        <li>Cargar datos de personas sin la autorización correspondiente.</li>
        <li>Intentar vulnerar la seguridad de la Plataforma o acceder a datos de otra academia.</li>
        <li>Usar la Plataforma con fines distintos a la gestión deportiva de una academia real.</li>
        <li>Revender o sublicenciar el acceso a la Plataforma sin autorización previa de Autix.</li>
      </ul>

      <h2 className={h2}>4. Planes, precios y pagos</h2>
      <p className={p}>
        Metrikas se ofrece bajo planes de suscripción mensual o anual, cuyos precios vigentes se publican en la
        Plataforma. El cobro se procesa a través de proveedores de pago externos (por ejemplo, MercadoPago). Los
        precios pueden ajustarse hacia adelante; los cambios no afectan períodos ya pagados.
      </p>
      <p className={p}>
        Si el pago de una suscripción no se completa, Metrikas otorga un breve período de gracia antes de
        suspender temporalmente el acceso de la academia. La suspensión no elimina los datos de la academia: al
        regularizar el pago, el acceso y la información se restablecen tal como estaban.
      </p>

      <h2 className={h2}>5. Cancelación y reembolsos</h2>
      <p className={p}>
        Puedes cancelar tu suscripción cuando quieras; el acceso se mantiene activo hasta el final del período ya
        pagado, sin renovación automática posterior. Salvo que la ley aplicable disponga lo contrario, los pagos
        ya realizados por un período de servicio no son reembolsables una vez iniciado dicho período.
      </p>

      <h2 className={h2}>6. Propiedad intelectual</h2>
      <p className={p}>
        El software, diseño, marca y contenidos de Metrikas son propiedad de Autix. Los datos que cada academia
        carga (jugadores, evaluaciones, estadísticas) siguen siendo propiedad de esa academia; Autix los trata
        únicamente para prestar el servicio, conforme a la <a href="/legal/privacy" className="text-blue-600 dark:text-blue-400 underline">Política de Privacidad</a>.
      </p>

      <h2 className={h2}>7. Disponibilidad del servicio</h2>
      <p className={p}>
        Hacemos esfuerzos razonables para mantener la Plataforma disponible y funcionando correctamente, pero no
        garantizamos un servicio ininterrumpido o libre de errores. Podemos realizar mantenimientos programados
        que interrumpan temporalmente el acceso, procurando avisar con anticipación cuando sea posible.
      </p>

      <h2 className={h2}>8. Limitación de responsabilidad</h2>
      <p className={p}>
        En la medida permitida por la ley, Autix no será responsable por daños indirectos, pérdida de datos por
        causas ajenas a su control, o decisiones tomadas por la academia con base en la información registrada en
        la Plataforma. La responsabilidad de Autix frente a una academia, en cualquier caso, no excederá el monto
        pagado por esa academia en los últimos doce meses.
      </p>

      <h2 className={h2}>9. Modificaciones a estos Términos</h2>
      <p className={p}>
        Podemos actualizar estos Términos para reflejar cambios en el servicio o en la normativa aplicable. Los
        cambios significativos se notificarán dentro de la Plataforma o por correo electrónico, y entrarán en
        vigor conforme a lo indicado en dicha notificación.
      </p>

      <h2 className={h2}>10. Ley aplicable y jurisdicción</h2>
      <p className={p}>
        Estos Términos se rigen por las leyes de la República de Chile. Cualquier controversia derivada de su
        interpretación o aplicación se someterá a los tribunales ordinarios de justicia de Chile, sin perjuicio de
        los derechos irrenunciables que la ley de protección al consumidor de tu país de residencia pueda
        otorgarte.
      </p>

      <h2 className={h2}>11. Contacto</h2>
      <p className={p}>
        ¿Preguntas sobre estos Términos? Escríbenos a{" "}
        <a href="mailto:info@metrikas.pro" className="text-blue-600 dark:text-blue-400 underline">info@metrikas.pro</a>.
      </p>
    </article>
  )
}
