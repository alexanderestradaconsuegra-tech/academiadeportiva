import type { Metadata, Viewport } from "next"
import { unstable_noStore as noStore } from "next/cache"
import "./globals.css"
import { AppProvider } from "@/context/AppContext"

export const metadata: Metadata = {
  title: "Metrikas — Academia de Fútbol",
  description: "Plataforma premium para entrenadores: registra jugadores, controla ejercicios y visualiza el progreso deportivo.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Metrikas",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#0B5CFF",
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
