// The six takes. Each one starts after its page is fully loaded (nothing is
// recorded while loading), begins and ends with the cursor at the same resting
// spot, and only uses what the app really does.
import { COACH_EMAIL, COACH_PASSWORD, PLAYER_EMAIL, PLAYER_PASSWORD } from "./seed.mjs"

const LUCAS = "0d3e7a10-0000-4000-8000-100000000003" // Lucas Ferrada (fictional)
const MATCH = "0d3e7a10-0000-4000-8000-800000000001" // upcoming Sub-12 match
const PLAYER = { email: PLAYER_EMAIL, password: PLAYER_PASSWORD } // Agustín Pavez (fictional)

export const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, colorScheme: "light", locale: "es-CL" }
export const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, colorScheme: "light", locale: "es-CL" }

async function typeLogin(d, page) {
  await d.pause(700)
  await d.click(page.getByLabel("Correo electrónico"))
  await d.type(COACH_EMAIL)
  await d.pause(250)
  await d.click(page.getByRole("textbox", { name: "Contraseña" }))
  await d.type(COACH_PASSWORD)
  await d.pause(350)
  await d.click(page.getByRole("button", { name: "Ingresar al panel" }))
  await page.waitForURL("**/dashboard")
  await page.getByText("Alertas de pago").waitFor()
  await page.getByText(/pagos vencidos/).first().waitFor()
}

export const CLIPS = [
  {
    id: "01-panel",
    title: "Ingreso y Panel de Control",
    device: DESKTOP,
    start: "/login",
    loggedIn: false,
    rest: { x: 1010, y: 690 },
    poster: 0.62,
    async run(d, page) {
      await typeLogin(d, page)
      await d.pause(900)
      await d.hover(page.getByText("Alertas de pago").first(), { ax: 0.9, dy: 30 })
      await d.pause(1000)
      await d.hover(page.getByText("Jugadores activos", { exact: false }).first(), { dy: 40 })
      await d.pause(700)
      await d.hover(page.getByText("Score promedio", { exact: false }).first(), { dy: 40 })
      await d.pause(700)
      await d.hover(page.getByText("Progreso del Equipo"), { ax: 1.6, dy: 140 })
      await d.pause(900)
      await d.goHome()
      await d.pause(700)
    },
  },
  {
    id: "02-asistencia",
    title: "Registrar asistencia de una categoría",
    device: DESKTOP,
    start: "/calendar",
    rest: { x: 1150, y: 560 },
    poster: 0.6,
    async run(d, page) {
      await d.pause(600)
      // The "Próximos" list: today's Sub-10 session first, then today's Sub-12 one.
      const btn = page.locator('button[title="Marcar asistencia"]').nth(1)
      const top = await btn.evaluate((el) => el.getBoundingClientRect().top + scrollY - 330)
      await d.scrollTo(top, 1100)
      await d.pause(450)
      await d.click(btn)
      const modal = page.locator("div.fixed.inset-0").filter({ hasText: "Asistencia —" })
      await modal.waitFor()
      await d.pause(650)
      const status = modal.locator(".overflow-y-auto button")
      for (let i = 0; i < 8; i++) {
        await d.click(status.nth(i), { speed: 1.7, settle: 80 })
        if (i === 3) {
          // Presente → Tarde → Justificado → Ausente: the app cycles on each tap.
          await d.pause(260)
          for (let k = 0; k < 3; k++) await d.tap(280)
        } else {
          await d.pause(170)
        }
      }
      await d.pause(700)
      await d.hover(modal.getByText(/presentes de/), { speed: 1.2 })
      await d.pause(900)
      await d.click(modal.getByRole("button", { name: "Cerrar" }))
      await d.pause(500)
      await d.goHome()
      await d.pause(700)
    },
  },
  {
    id: "03-evaluacion",
    title: "Cargar una evaluación y ver la evolución",
    device: DESKTOP,
    start: `/players/${LUCAS}`,
    rest: { x: 1180, y: 560 },
    poster: 0.45,
    async run(d, page) {
      await d.pause(600)
      await d.click(page.getByRole("button", { name: /Nueva evaluación/ }).first())
      const modal = page.locator("div.fixed.inset-0").filter({ hasText: "Nueva Evaluación" })
      await modal.waitFor()
      await d.pause(500)
      const fields = modal.locator('input:not([type="date"])')
      const values = ["82", "76", "80", "78", "75", "81"]
      for (let i = 0; i < values.length; i++) {
        await d.click(fields.nth(i), { speed: 1.5, ax: 0.25, settle: 90 })
        await d.replaceValue(values[i])
      }
      await d.pause(350)
      await d.click(modal.getByRole("button", { name: "Guardar" }))
      await modal.waitFor({ state: "detached" })
      await d.pause(500)
      await d.hover(page.getByText("Atributos Físicos y Técnicos"), { ax: 0.5, dy: 110 })
      await d.pause(800)
      const summary = page.locator("summary").filter({ hasText: /Historial/ })
      const top = await summary.evaluate((el) => el.getBoundingClientRect().top + scrollY - 160)
      await d.scrollTo(top, 1200)
      await d.pause(300)
      await d.click(summary, { ax: 0.3 })
      await page.getByText("Evolución", { exact: false }).first().waitFor()
      await d.pause(300)
      await d.scrollTo(top + 230, 800)
      await d.pause(500)
      const chart = page.locator(".recharts-wrapper").first()
      await d.hover(chart, { ax: 0.97, ay: 0.3 })
      await d.pause(1100)
      await d.goHome()
      await d.pause(700)
    },
  },
  {
    id: "04-pagos",
    title: "Pagos: quién debe y registrar un pago",
    device: DESKTOP,
    start: "/payments",
    rest: { x: 1180, y: 300 },
    poster: 0.55,
    async run(d, page) {
      await d.pause(600)
      const overdue = page.getByText("Vencidos", { exact: true }).first()
      await d.hover(overdue, { ax: 3.2, dy: 26 })
      await d.pause(1000)
      for (const name of ["Lucas Ferrada", "Maximiliano Tapia"]) {
        // The payment row (a ".group" card) that still offers "Marcar pagado".
        const row = page.locator("div.group").filter({ has: page.getByText(name, { exact: true }) }).filter({ has: page.getByRole("button", { name: /Marcar pagado/ }) }).first()
        await d.hover(row, { ax: 0.35 })
        await d.pause(350)
        await d.click(row.getByRole("button", { name: /Marcar pagado/ }))
        await d.pause(900)
      }
      await d.hover(overdue, { ax: 3.2, dy: 26 })
      await d.pause(1200)
      await d.goHome()
      await d.pause(700)
    },
  },
  {
    id: "05-reporte",
    title: "Abrir un reporte listo para compartir",
    device: DESKTOP,
    start: `/players/${LUCAS}`,
    rest: { x: 1180, y: 560 },
    poster: 0.6,
    async run(d, page) {
      await d.pause(600)
      const link = page.getByRole("link", { name: /Ver reporte/ })
      const top = await link.evaluate((el) => el.getBoundingClientRect().top + scrollY - 520)
      await d.scrollTo(top, 1100)
      await d.pause(300)
      await d.click(link)
      await page.getByText("Reporte del Jugador").waitFor()
      await page.getByText(/Reporte de rendimiento/i).first().waitFor()
      await d.pause(900)
      await d.hover(page.getByText("Áreas a mejorar", { exact: false }).first(), { dy: 30 })
      await d.pause(900)
      await d.scrollTo(380, 1100)
      await d.hover(page.getByText("Recomendaciones del Entrenador"), { dy: 60 })
      await d.pause(1000)
      await d.scrollTo(0, 900)
      await d.hover(page.getByRole("button", { name: /Descargar PDF/ }))
      await d.pause(1100)
      await d.goHome()
      await d.pause(700)
    },
  },
  {
    id: "06-movil",
    title: "En el teléfono: ingreso y panel",
    device: MOBILE,
    start: "/login",
    loggedIn: false,
    rest: { x: 300, y: 720 },
    cursorSize: 34,
    poster: 0.7,
    async run(d, page) {
      await typeLogin(d, page)
      await d.pause(900)
      await d.hover(page.getByText("Alertas de pago").first(), { dy: 60 })
      await d.pause(900)
      await d.goHome()
      const top = await page.getByText("Requieren atención", { exact: true }).evaluate((el) => el.getBoundingClientRect().top + scrollY - 140)
      await d.scrollTo(top, 1100)
      await d.pause(1000)
      await d.scrollTo(0, 1000)
      await d.pause(800)
    },
  },
  {
    id: "07-convocatoria",
    title: "El jugador: su convocatoria y la alineación",
    device: MOBILE,
    account: PLAYER,
    start: `/matches/${MATCH}`,
    rest: { x: 300, y: 690 },
    cursorSize: 34,
    poster: 0.62,
    async run(d, page) {
      await d.pause(700)
      await d.click(page.getByRole("link", { name: /Ver mi convocatoria/ }))
      await page.getByText("¡Estás convocado/a!").waitFor()
      await d.pause(900)
      await d.hover(page.getByText("Instrucción del entrenador:"), { ax: 0.9, dy: 30 })
      await d.pause(1000)
      await d.click(page.getByRole("button", { name: /Voy a ir/ }))
      await page.getByText("✓ Confirmado").first().waitFor()
      await d.pause(1000)
      const top = await page.getByText(/^Formación/).evaluate((el) => el.getBoundingClientRect().top + scrollY - 70)
      await d.scrollTo(top, 1300)
      await d.pause(400)
      await d.hover(page.locator("div.bg-amber-400").first(), { speed: 0.9 })
      await d.pause(1300)
      await d.goHome()
      await d.scrollTo(top + 420, 1100)
      await d.pause(1600)
    },
  },
  {
    id: "08-tactica",
    title: "El jugador: la jugada animada en el tablero",
    device: MOBILE,
    account: PLAYER,
    start: "/tactics",
    rest: { x: 300, y: 640 },
    cursorSize: 34,
    poster: 0.7,
    async run(d, page) {
      await d.pause(700)
      await d.click(page.getByRole("button", { name: "Ajustes y jugadas" }))
      const sheet = page.getByRole("dialog", { name: "Ajustes y jugadas" })
      await sheet.waitFor()
      await d.pause(700)
      await d.click(sheet.getByRole("button", { name: /^Salida por la derecha/ }), { ax: 0.35 })
      await d.pause(600)
      await d.click(sheet.getByRole("button", { name: "Cerrar" }).last())
      await sheet.waitFor({ state: "detached" })
      await d.pause(1100)
      await d.click(page.getByRole("button", { name: "Ver", exact: true }))
      // The play runs, holds its last frame for a moment, then the button reads "Ver" again.
      await page.getByRole("button", { name: /Detener/ }).first().waitFor()
      await page.getByRole("button", { name: "Ver", exact: true }).waitFor({ timeout: 15000 })
      await d.pause(400)
      await d.goHome({ speed: 0.8 })
      await d.pause(900)
    },
  },
]
