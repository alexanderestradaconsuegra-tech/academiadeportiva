# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: dueños y entrenadores de academias de fútbol infantil/juvenil (Chile/LatAm) que hoy gestionan la academia con Excel y grupos de WhatsApp. Secundario: jugadores (y sus padres/apoderados), que ven su propio progreso, calendario y pagan su mensualidad. Roles del sistema: coach (dueño/entrenador, acceso total), assistant (ve solo su categoría), player (ve solo lo suyo).

## Product Purpose

Reemplazar Excel y WhatsApp como la forma de gestionar una academia de fútbol: convocatorias con confirmación individual, evaluaciones físicas con gráficas de progreso, calendario de entrenamientos con asistencia/RSVP del jugador, pizarra táctica, seguimiento físico (ritmo cardíaco, esfuerzo, lesiones y pruebas de rendimiento), comunicación con jugadores, y cobro automático de mensualidades. Se posiciona deliberadamente como herramienta de gestión deportiva, no como sistema clínico o médico. Éxito = que el dueño de la academia deje de depender de Excel/WhatsApp/cobro manual, y que los jugadores se mantengan comprometidos con su propio progreso.

## Positioning

Todo en un solo lugar: reemplaza la combinación de Excel + grupos de WhatsApp + cobro manual de mensualidades por un único sistema (confirmado por el dueño del producto). Un competidor de nicho estrecho (solo pagos, o solo evaluaciones, o solo asistencia) no puede igualar esto sin construir el resto.

## Operating Context

Chile/LatAm. Uso mayoritariamente móvil — entrenadores y jugadores entran desde el celular, no desde escritorio. Pagos vía MercadoPago (elegido sobre Stripe por mejor cobertura de métodos de pago locales en Chile). Comunicación de soporte cercana a WhatsApp. Multi-idioma: español, inglés, portugués. Multi-tenant: cada academia queda completamente aislada de las demás (RLS por `academy_id` en Supabase).

## Capabilities and Constraints

Next.js 14 (App Router) + Supabase (Postgres/Auth/Storage). Roles: coach, assistant (limitado a su categoría), player (limitado a lo propio). Pagos con dos niveles de token MercadoPago: uno global de Metrikas (academia → Metrikas, suscripción) y uno propio por academia (jugador → academia, mensualidad). Fotos de jugadores y logo de academia se sirven por un endpoint propio autenticado y con verificación de academia — no hay bucket público. Sin app nativa todavía; publicarla en Play Store/App Store es un proyecto futuro no confirmado (la marca "Metrikas" está registrada en INAPI clase 42, web, no clase 9/app, hasta que se decida).

## Brand Commitments

Nombre: Metrikas. Paleta de marca: navy oscuro (`#05122F`) + verde lima (`#a3e635`), reemplazando un azul brillante anterior (`#0B5CFF`). Logo existente (trazo blanco con acento verde). La "tarjeta de jugador" estilo FIFA (rating general, seis atributos, nivel PRO/TOP/ELITE, descargable como PNG) es el elemento visual insignia del producto y aparece tanto en el sistema como en el material de marketing.

## Evidence on Hand

Sin testimonios ni casos de clientes documentados todavía (confirmado por el dueño del producto). No inventar testimonios, cifras de clientes ni casos de éxito en trabajo de marketing futuro hasta que el dueño los provea.

## Product Principles

1. Reemplazar herramientas manuales (Excel, WhatsApp, cobro a mano) con un solo sistema — no competir en una sola función aislada.
2. El progreso del jugador debe sentirse motivador y compartible (la tarjeta FIFA), no solo un número en una planilla.
3. Cada academia está completamente aislada de las demás — nunca mezclar datos entre academias.
4. Optimizado para uso móvil real, no solo escritorio.
5. Construido para el mercado chileno/latinoamericano: pagos locales (MercadoPago), soporte en español, precios en CLP.

## Accessibility & Inclusion

Sin requisito de accesibilidad específico establecido todavía por el usuario.
