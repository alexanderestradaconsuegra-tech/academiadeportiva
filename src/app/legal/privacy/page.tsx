import Link from "next/link"

export const metadata = { title: "Política de Privacidad — FutbolMetrics" }

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-[#0B5CFF] hover:underline">← Volver</Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-4 mb-2">Política de Privacidad</h1>
        <p className="text-sm text-slate-400 mb-8">Última actualización: {new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Quiénes somos</h2>
            <p>
              FutbolMetrics es una plataforma de gestión deportiva ofrecida como software como servicio (SaaS) a academias
              de fútbol, clubes y escuelas deportivas ("Academias"). Cada Academia contrata el servicio para gestionar
              jugadores, entrenamientos, partidos, evaluaciones físicas y pagos de su propia institución.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Roles y responsabilidades</h2>
            <p>
              FutbolMetrics actúa como <strong>encargado del tratamiento</strong> de los datos que cada Academia carga en la
              plataforma. La Academia (a través de su entrenador o representante) actúa como <strong>responsable del
              tratamiento</strong> de los datos de sus propios jugadores, y es quien debe obtener el consentimiento
              correspondiente de los jugadores y, cuando el jugador sea menor de edad, de sus padres o acudientes legales,
              antes de registrar su información en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Datos que se recopilan</h2>
            <p>Según el uso que la Academia le dé a la plataforma, se pueden almacenar los siguientes datos de cada jugador:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Datos de identificación: nombre, fecha de nacimiento, foto, posición, club, categoría.</li>
              <li>Datos de contacto de acceso: correo electrónico (para el jugador o su acudiente).</li>
              <li>Datos deportivos: evaluaciones físicas y técnicas, estadísticas de partidos, asistencia a entrenamientos.</li>
              <li>
                Datos de salud y biométricos: ritmo cardíaco, presión arterial, porcentaje de grasa corporal, lesiones,
                pruebas físicas y sesiones de monitoreo en vivo (si la Academia decide registrarlos).
              </li>
              <li>Datos financieros: registro de pagos y cuotas asociadas al jugador dentro de su Academia.</li>
              <li>Enlaces a videos de referencia (entrenamientos, partidos, técnica) que la Academia decida vincular.</li>
            </ul>
            <p>
              Los datos de salud son <strong>datos sensibles</strong> y los datos de menores de edad reciben protección
              reforzada conforme a la legislación aplicable. La Academia solo debe registrar esta información si cuenta
              con la autorización correspondiente.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Cómo se protegen los datos</h2>
            <p>
              La información de cada Academia está aislada mediante controles de seguridad a nivel de base de datos
              (Row Level Security), de modo que ninguna Academia puede acceder a los datos de otra. Dentro de una misma
              Academia, un jugador solo puede ver su propia información; el entrenador tiene acceso administrativo a los
              datos de los jugadores de su Academia. Las contraseñas se gestionan de forma cifrada por el proveedor de
              autenticación (Supabase) y nunca se almacenan en texto plano.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Terceros que procesan datos en nuestro nombre</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Supabase</strong> — alojamiento de base de datos y autenticación.</li>
              <li><strong>Stripe</strong> — procesamiento de pagos de la suscripción de la Academia a la plataforma (no procesa los pagos que la Academia le cobra a sus propios jugadores, que la Academia gestiona por sus propios medios).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">6. Derechos de los titulares</h2>
            <p>
              Los jugadores (o sus padres/acudientes, si son menores de edad) y entrenadores pueden solicitar en cualquier
              momento a su Academia: acceso, corrección, actualización o eliminación de sus datos personales. La Academia,
              como responsable del tratamiento, es el primer punto de contacto para ejercer estos derechos. FutbolMetrics
              facilita a la Academia las herramientas técnicas para atender estas solicitudes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">7. Retención y eliminación</h2>
            <p>
              Los datos se conservan mientras la Academia mantenga una cuenta activa en la plataforma. Si la Academia
              cancela su suscripción, sus datos permanecen almacenados durante un período razonable antes de ser eliminados
              definitivamente, salvo solicitud expresa de eliminación anticipada.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">8. Contacto</h2>
            <p>
              Para consultas sobre esta política o para ejercer tus derechos, contacta directamente a tu Academia, o
              escribe a <a className="text-[#0B5CFF] hover:underline" href="mailto:alexanderestradaconsuegra@gmail.com">alexanderestradaconsuegra@gmail.com</a>.
            </p>
          </section>

          <p className="text-xs text-slate-400 italic pt-4 border-t border-slate-100 dark:border-slate-800">
            Este documento es una guía general y no sustituye asesoría legal profesional. Se recomienda que el operador
            de la plataforma la revise con un abogado especializado en protección de datos, particularmente en lo
            relativo al tratamiento de datos de menores de edad, antes de su uso comercial.
          </p>
        </div>
      </div>
    </div>
  )
}
