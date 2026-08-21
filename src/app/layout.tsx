import type { Metadata, Viewport } from "next"
import { unstable_noStore as noStore } from "next/cache"
import "./globals.css"
import { AppProvider } from "@/context/AppContext"

const APP_URL = (process.env.NEXT_PUBLIC_URL ?? "https://app.metrikas.pro").replace(/\/$/, "")
const TITLE = "Metrikas — Gestión de academias de fútbol"
const DESCRIPTION =
  "Convocatorias con confirmación, evaluaciones con gráficas de progreso, asistencia y cobro automático de mensualidades. Deja el Excel y los grupos de WhatsApp."

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: TITLE,
    template: "%s · Metrikas",
  },
  description: DESCRIPTION,
  applicationName: "Metrikas",
  keywords: [
    "academia de fútbol",
    "gestión deportiva",
    "escuela de fútbol",
    "convocatorias",
    "evaluación de jugadores",
    "asistencia entrenamientos",
    "mensualidades academia",
  ],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    siteName: "Metrikas",
    title: TITLE,
    description: DESCRIPTION,
    url: APP_URL,
    locale: "es_CL",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Metrikas" }],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/icon-512.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Metrikas",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "256x256" },
    ],
    apple: "/apple-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#05122F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

const THEME_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  noStore()
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""
  const configScript = `window.__SC__=${JSON.stringify({ u: sbUrl, k: sbKey, v: vapidKey })};`

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: configScript }} />
      </head>
      <body suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
