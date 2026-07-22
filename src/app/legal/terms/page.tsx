import Link from "next/link"

export const metadata = { title: "Términos de Servicio — Metrikas" }

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-[#0B5CFF] hover:underline">← Volver</Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-2">Términos de Servicio</h1>
        <p className="text-sm text-slate-400 mb-8">Última actualización: {new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Aceptación de los términos</h2>
            <p>
              Al crear una cuenta y registrar una academia en Metrikas ("la Plataforma"), aceptas estos Términos de
              Servicio y la Política de Privacidad. Si no estás de acuerdo, no debes usar la Plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Descripción del servicio</h2>
            <p>
              Metrikas es un software de gestión para academias de fútbol que permite administrar jugadores,
              entrenamientos, partidos, evaluaciones físicas, pagos internos de la academia y comunicación con jugadores,
              bajo un modelo de suscripción.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Registro y responsabilidad de la cuenta</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>El registro de una nueva academia requiere un código de activación entregado por el operador de la Plataforma.</li>
              <li>El entrenador que crea la cuenta es responsable de la exactitud de la información registrada y de obtener el consentimiento necesario de los jugadores (o de sus padres/acudientes si son menores de edad) antes de cargar sus datos.</li>
              <li>El entrenador es responsable de mantener la confidencialidad de sus credenciales de acceso y de las que otorgue a jugadores o acudientes.</li>
              <li>Cada academia es responsable del contenido y la veracidad de los datos que registra (jugadores, resultados, pagos, evaluaciones).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Suscripción y pagos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>El acceso a la Plataforma requiere una suscripción activa, pagada de forma periódica según el plan contratado.</li>
              <li>Si el pago no se realiza o falla, el acceso de la academia puede ser suspendido hasta que se regularice la situación. Los datos de la academia no se eliminan por una suspensión temporal.</li>
              <li>Los pagos que la academia registra dentro de la Plataforma para cobrar cuotas a sus propios jugadores (por ejemplo, mensualidades) son gestionados directamente por la academia; Metrikas no procesa ni es responsable de esos cobros.</li>
              <li>Los precios pueden actualizarse con previo aviso razonable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Propiedad de los datos</h2>
            <p>
              Los datos que una academia registra en la Plataforma (jugadores, estadísticas, evaluaciones, pagos, etc.)
              son propiedad de esa academia. Metrikas actúa únicamente como proveedor de la infraestructura técnica
              para almacenarlos y gestionarlos, conforme a la Política de Privacidad.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">6. Uso aceptable</h2>
            <p>No está permitido:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Compartir credenciales de acceso con personas ajenas a la academia.</li>
              <li>Intentar acceder a datos de otra academia distinta a la propia.</li>
              <li>Utilizar la Plataforma para almacenar información falsa o con fines distintos a la gestión deportiva de la academia.</li>
              <li>Realizar ingeniería inversa, intentar vulnerar la seguridad de la Plataforma o sobrecargar sus sistemas deliberadamente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">7. Disponibilidad del servicio</h2>
            <p>
              Se realizan esfuerzos razonables para mantener la Plataforma disponible, pero no se garantiza un
              funcionamiento ininterrumpido. Pueden existir mantenimientos programados o interrupciones no planificadas.
              La Plataforma se ofrece "tal cual", sin garantías de ningún tipo más allá de las exigidas por la ley.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">8. Limitación de responsabilidad</h2>
            <p>
              Metrikas no será responsable por decisiones deportivas, médicas o administrativas que la academia
              tome con base en la información registrada en la Plataforma. La Plataforma es una herramienta de gestión
              y no sustituye el criterio profesional de entrenadores, médicos deportivos o cuerpos técnicos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">9. Terminación</h2>
            <p>
              La academia puede cancelar su suscripción en cualquier momento. El operador de la Plataforma puede suspender
              o terminar una cuenta por incumplimiento de estos términos, falta de pago prolongada, o uso indebido de la
              Plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">10. Ley aplicable</h2>
            <p>Estos términos se rigen por las leyes de la República de Colombia.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">11. Contacto</h2>
            <p>
              Para consultas sobre estos Términos, escribe a{" "}
              <a className="text-[#0B5CFF] hover:underline" href="mailto:alexanderestradaconsuegra@gmail.com">alexanderestradaconsuegra@gmail.com</a>.
            </p>
          </section>

          <p className="text-xs text-slate-400 italic pt-4 border-t border-slate-100 dark:border-slate-800">
            Este documento es una guía general y no sustituye asesoría legal profesional. Se recomienda revisarlo con un
            abogado antes de su uso comercial, especialmente en lo relacionado con el tratamiento de datos de menores
            de edad y la normativa de protección al consumidor aplicable.
          </p>
        </div>
      </div>
    </div>
  )
}
