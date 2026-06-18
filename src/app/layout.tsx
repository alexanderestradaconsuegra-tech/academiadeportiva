import type { Metadata, Viewport } from "next"
import "./globals.css"
import { AppProvider } from "@/context/AppContext"

export const metadata: Metadata = {
  title: "FutbolMetrics — Academia de Fútbol",
  description: "Plataforma premium para entrenadores: registra jugadores, controla ejercicios y visualiza el progreso deportivo.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FutbolMetrics",
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
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
