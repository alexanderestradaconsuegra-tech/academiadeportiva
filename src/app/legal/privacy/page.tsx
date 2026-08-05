import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidad — Metrikas",
  description: "Cómo Metrikas recopila, usa y protege los datos de academias, jugadores y apoderados.",
}

const h2 = "text-xl font-black text-slate-900 dark:text-white mt-10 mb-3 first:mt-0"
const h3 = "text-base font-bold text-slate-800 dark:text-slate-100 mt-6 mb-2"
const p = "text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-3"
const ul = "list-disc pl-5 space-y-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-3"

export default function PrivacyPage() {
  return (
    <article>
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">Legal</p>
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">Política de Privacidad</h1>
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Última actualización: 5 de agosto de 2026</p>

      <p className={p}>
        Esta Política de Privacidad describe cómo <strong>Autix</strong> ("Autix", "nosotros"), desarrollador y
        operador de <strong>Metrikas</strong> (la "Plataforma"), recopila, usa, almacena y protege los datos
        personales de quienes usan la Plataforma. Al crear una cuenta o usar Metrikas, aceptas las prácticas
        descritas aquí.
      </p>
      <p className={p}>
        Esta política se rige por la Ley N° 19.628 sobre Protección de la Vida Privada y por la Ley N° 21.719 que
        regula la protección de los datos personales en Chile, sin perjuicio de otras normas aplicables en el país
        donde opere tu academia.
      </p>

      <h2 className={h2}>1. Quién es responsable de qué datos</h2>
      <p className={p}>
        Metrikas es una herramienta que cada academia de fútbol usa para administrar a sus propios jugadores,
        profesores y apoderados. Es importante distinguir dos roles:
      </p>
      <ul className={ul}>
        <li>
          <strong>La academia (responsable del tratamiento):</strong> decide qué datos de sus jugadores, familias y
          profesores carga en la Plataforma, y es responsable de contar con las autorizaciones necesarias para
          hacerlo — en particular tratándose de menores de edad.
        </li>
        <li>
          <strong>Autix (encargado del tratamiento):</strong> opera la infraestructura técnica que almacena y
          procesa esos datos por cuenta de la academia, con las medidas de seguridad descritas en esta política.
        </li>
      </ul>

      <h2 className={h2}>2. Qué datos recopilamos</h2>
      <h3 className={h3}>2.1 Datos de cuenta</h3>
      <ul className={ul}>
        <li>Nombre, correo electrónico y contraseña (cifrada, nunca almacenada en texto plano).</li>
        <li>Rol dentro de la academia (administrador, profesor o jugador) y la categoría a la que perteneces.</li>
      </ul>
      <h3 className={h3}>2.2 Datos de jugadores</h3>
      <ul className={ul}>
        <li>Datos personales básicos: nombre, fecha de nacimiento, categoría, foto de perfil (opcional).</li>
        <li>
          Datos de salud y biometría — <strong>categoría de dato sensible</strong>: lesiones, mediciones físicas,
          pruebas de rendimiento, ritmo cardíaco y evolución física. Estos datos solo los ingresa la academia o el
          propio jugador/apoderado, y se muestran únicamente a quienes tienen acceso autorizado dentro de esa
          academia.
        </li>
        <li>Asistencia a entrenamientos, convocatorias, partidos y estadísticas de juego.</li>
      </ul>
      <h3 className={h3}>2.3 Datos de pagos</h3>
      <p className={p}>
        Metrikas <strong>no almacena números de tarjeta ni credenciales bancarias</strong>. El cobro de mensualidades
        y suscripciones se procesa a través de proveedores externos (por ejemplo, MercadoPago). Nosotros solo
        registramos el estado del pago (pagado, pendiente, vencido) y el monto correspondiente.
      </p>
      <h3 className={h3}>2.4 Datos técnicos</h3>
      <ul className={ul}>
        <li>Dirección IP, tipo de dispositivo y navegador, con fines de seguridad y soporte técnico.</li>
        <li>Token de notificaciones push, si activas los avisos en tu celular.</li>
      </ul>

      <h2 className={h2}>3. Datos de niños, niñas y adolescentes</h2>
      <p className={p}>
        Muchos jugadores registrados en Metrikas son menores de edad. La carga de sus datos en la Plataforma es
        responsabilidad de la academia, quien declara contar con la autorización de los padres, madres o
        apoderados correspondientes. Los apoderados pueden solicitar a la academia el acceso, la rectificación o
        la eliminación de los datos de sus hijos en cualquier momento, y la academia puede canalizar esa solicitud
        a través nuestro escribiendo a <a href="mailto:info@metrikas.pro" className="text-blue-600 dark:text-blue-400 underline">info@metrikas.pro</a>.
      </p>

      <h2 className={h2}>4. Para qué usamos tus datos</h2>
      <ul className={ul}>
        <li>Prestar el servicio: gestión de jugadores, convocatorias, asistencia, evaluaciones físicas y pagos.</li>
        <li>Enviar notificaciones relevantes (convocatoria, entrenamiento, estado de pago).</li>
        <li>Dar soporte técnico y responder consultas.</li>
        <li>Mantener la seguridad de la Plataforma y prevenir accesos no autorizados.</li>
        <li>Cumplir obligaciones legales cuando corresponda.</li>
      </ul>
      <p className={p}>
        No vendemos ni arrendamos tus datos a terceros, y no los usamos con fines publicitarios.
      </p>

      <h2 className={h2}>5. Con quién compartimos datos</h2>
      <p className={p}>
        Compartimos datos únicamente con proveedores que nos ayudan a operar la Plataforma, bajo obligaciones de
        confidencialidad:
      </p>
      <ul className={ul}>
        <li><strong>Supabase</strong> — hospedaje de la base de datos y autenticación.</li>
        <li><strong>MercadoPago</strong> (y otros medios de pago que se habiliten en el futuro) — procesamiento de cobros.</li>
        <li>Proveedores de correo y notificaciones push, para el envío de avisos.</li>
      </ul>
      <p className={p}>
        Estos proveedores pueden almacenar información en servidores ubicados fuera de tu país. En esos casos,
        exigimos que mantengan estándares de seguridad equivalentes a los descritos en esta política.
      </p>
      <p className={p}>
        Cada academia tiene sus datos completamente aislados de las demás: ninguna otra academia puede ver o
        acceder a tu información, ni siquiera técnicamente.
      </p>

      <h2 className={h2}>6. Seguridad</h2>
      <ul className={ul}>
        <li>Contraseñas cifradas, nunca almacenadas ni visibles en texto plano.</li>
        <li>Aislamiento de datos por academia (multi-tenant) a nivel de base de datos.</li>
        <li>Acceso restringido según el rol de cada usuario (administrador, profesor, jugador).</li>
      </ul>

      <h2 className={h2}>7. Plazo de conservación</h2>
      <p className={p}>
        Conservamos tus datos mientras la cuenta de tu academia permanezca activa. Si una academia suspende su
        suscripción, sus datos se mantienen guardados (no se eliminan automáticamente) para que pueda recuperar el
        acceso al reactivar el pago. Puedes solicitar la eliminación definitiva de tu cuenta o de datos específicos
        escribiendo a <a href="mailto:info@metrikas.pro" className="text-blue-600 dark:text-blue-400 underline">info@metrikas.pro</a>.
      </p>

      <h2 className={h2}>8. Tus derechos</h2>
      <p className={p}>
        De acuerdo con la normativa chilena de protección de datos personales, puedes ejercer en cualquier momento
        tus derechos de <strong>acceso, rectificación, cancelación y oposición</strong> (derechos ARCO) sobre tus
        datos personales, así como solicitar la portabilidad de tu información. Para ejercerlos, escribe a{" "}
        <a href="mailto:info@metrikas.pro" className="text-blue-600 dark:text-blue-400 underline">info@metrikas.pro</a>{" "}
        indicando tu nombre, academia y la solicitud puntual. Responderemos dentro de un plazo razonable.
      </p>

      <h2 className={h2}>9. Cookies y almacenamiento local</h2>
      <p className={p}>
        Usamos almacenamiento local del navegador únicamente para mantener tu sesión iniciada y recordar tu
        preferencia de tema claro/oscuro. No utilizamos cookies de publicidad ni herramientas de rastreo de
        terceros.
      </p>

      <h2 className={h2}>10. Cambios a esta política</h2>
      <p className={p}>
        Podemos actualizar esta política para reflejar cambios en la Plataforma o en la normativa aplicable. Si el
        cambio es significativo, lo notificaremos dentro de la Plataforma o por correo electrónico.
      </p>

      <h2 className={h2}>11. Contacto</h2>
      <p className={p}>
        ¿Dudas sobre esta política o sobre tus datos? Escríbenos a{" "}
        <a href="mailto:info@metrikas.pro" className="text-blue-600 dark:text-blue-400 underline">info@metrikas.pro</a>.
      </p>
    </article>
  )
}
