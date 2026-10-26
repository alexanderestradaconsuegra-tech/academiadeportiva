# Video demo de Métrikas

Grabación automática de la app para el portafolio. Todo lo de esta carpeta es
solo para grabar: no se despliega, no cambia el código de la app y no usa la
base de datos real.

## Regenerar todo con un comando

```bash
cd demo-video
npm install          # solo la primera vez (playwright-core + @fontsource/inter)
npm run record       # build + grabación + codificación → out/
```

- `npm run record -- --skip-build` reutiliza el último build de demo.
- `npm run record -- 04-pagos` graba solo ese clip (se pueden pasar varios).

El clip `09-cuenta-demo` también necesita la web ya compilada (repo `web-metrikas`, `npx vinext build`) en una carpeta hermana, o `DEMO_WEB_DIR=/ruta`.
Ninguna llamada sale a los servicios reales: las dos respuestas del servidor (pedir código y crear academia) se simulan en la grabación y el correo se arma con la plantilla real de `src/app/api/demo/request/route.ts` con datos ficticios.

Requisitos: Node 20+, ffmpeg con libx264 y libvpx-vp9, y el Chromium que trae
Playwright (`PLAYWRIGHT_BROWSERS_PATH`). No hace falta `playwright install`.

## Cómo funciona

1. `mock-supabase.mjs` levanta en `127.0.0.1:54321` un Supabase falso en memoria
   (Auth + PostgREST) con los datos de `seed.mjs`. Acepta escrituras, pero solo
   en memoria, y se reinicia antes de cada toma.
2. `run.mjs` compila la app **sin tocar su código**, solo con variables de entorno
   que apuntan al Supabase falso (`NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY=demo.anon.key`), y la sirve en `127.0.0.1:3410`.
3. `record.mjs` + `clips.mjs` graban cada toma con Playwright y la captura de
   DevTools (`Page.startScreencast`). La página se precarga entera antes de grabar,
   así no aparecen pantallas de carga.
4. `lib/director.mjs` dibuja un cursor circular suave (pulso al hacer clic), mueve
   el mouse en curvas con aceleración, escribe tecla por tecla y hace scroll suave.
5. `encode.mjs` arma los fotogramas a 30 fps con ffmpeg y agrega un fundido de 0,6 s
   al primer fotograma para que el clip quede en loop. Luego genera MP4 (H.264,
   yuv420p, faststart, sin audio), WebM (VP9) y un póster JPG por ancho, más la
   hoja de contactos.

Resolución de captura: escritorio 1440×900 CSS a dpr 2 (2880×1800). Teléfono
390×844 CSS a dpr 3 (1170×2532), para que la salida de 828 px no se escale hacia
arriba. El diseño de la página es el mismo que a dpr 2.

## Clips

| Clip | Qué muestra | Formato |
|---|---|---|
| `01-panel` | Ingreso y Panel de Control: alerta de pagos vencidos, jugadores activos, score promedio, progreso del equipo | Escritorio |
| `02-asistencia` | Calendario → sesión de hoy Sub-12 → marcar asistencia (7 presentes, 1 ausente) | Escritorio |
| `03-evaluacion` | Ficha de Lucas Ferrada → Nueva evaluación → atributos y score suben → gráfico "Evolución del Score" | Escritorio |
| `04-pagos` | Pagos: vencidos $140.000 (4) → marcar pagado a 2 alumnos → vencidos $70.000 (2) | Escritorio |
| `05-reporte` | Ficha → Ver reporte → reporte del jugador listo para "Descargar PDF" (no se imprime nada) | Escritorio |
| `06-movil` | En el teléfono: ingreso y panel con alerta de pagos | Teléfono |
| `07-convocatoria` | Cuenta de un jugador: abre su convocatoria, lee la instrucción del entrenador, confirma "Voy a ir" y ve su lugar en la alineación | Teléfono |
| `08-tactica` | Cuenta de un jugador: abre una jugada guardada en el tablero táctico y la ve animada | Teléfono |
| `09-cuenta-demo` | Cómo abrir una cuenta demo (54 s, con subtítulos de paso): pedir el código en metrikas.pro → el correo con el código → crear la academia en app.metrikas.pro → panel con "Acceso de demo — 14 días restantes" | Escritorio |
| `10-cuenta-demo-movil` | El mismo recorrido de cuenta demo en pantalla de celular (43 s), con subtítulos que no tapan botones | Teléfono |

Salidas en `out/<clip>/`: escritorio en 840, 1280 y 1680 px; teléfono en 560 y
828 px. `out/FILES.md` lista duración, peso y ruta de cada archivo y
`out/contact-sheet.jpg` muestra un cuadro cada 2 s.

## Datos ficticios usados

Todo es inventado. No hay ninguna academia, alumno, apoderado ni foto real.

- Academia: **Club Deportivo Los Aromos** (Santiago), mensualidad $35.000.
- Entrenador: **Profe Andrés Vera**, `entrenador@losaromos.example` / `demo-2026`
  (dominio `.example`, reservado y que no existe).
- Cuenta de jugador: **Agustín Pavez** (Sub-12, extremo derecho),
  `agustin@losaromos.example` / `demo-2026`.
- 18 jugadores con nombres inventados y avatares SVG con iniciales (sin fotos):
  - Sub-12: Martín Ossandón, Benjamín Lagos, Lucas Ferrada, Agustín Pavez, Vicente Moya,
    Joaquín Aedo, Maximiliano Tapia, Felipe Urrutia, Cristóbal Henríquez, Diego Salgado,
    Emilio Cortés, Renato Sepúlveda.
  - Sub-10: Tomás Villagra, Gaspar Olivares, Simón Carrasco, Bruno Espinoza,
    León Arancibia, Alonso Fuenzalida.
- 3 evaluaciones por jugador (hace 5, 3 y 1 mes). Lucas Ferrada queda algo más
  bajo para que su nueva evaluación muestre una mejora.
- Entrenamientos: Sub-12 martes y jueves 18:00, Sub-10 lunes y miércoles 17:00,
  8 semanas hacia atrás y 2 hacia adelante, con asistencia pasada. Siempre hay
  una sesión Sub-12 hoy sin asistencia tomada.
- Pagos: 3 meses de mensualidades. Este mes deben 4 alumnos (Lucas Ferrada,
  Maximiliano Tapia, Diego Salgado, Simón Carrasco), vencidos desde el día 5.
- 2 gastos, 8 actividades y 1 partido contra "Club Ejemplo Norte".
- Convocatoria para ese partido en formación "F8 · 2-2-3" con 8 jugadores, notas
  del entrenador y una instrucción para Agustín.
- Cuenta que se abre en el clip de cuenta demo: academia "Club Deportivo Los Aromos", `profe.andres@losaromos.example`, código de ejemplo `DEMO-K7QM4X9T` (no existe en ninguna base).
- 2 jugadas guardadas en el tablero táctico ("Salida por la derecha" y "Córner corto").

Las fechas se calculan a partir del día de grabación, así que "hoy", "este mes"
y "vencido" siempre cuadran.
