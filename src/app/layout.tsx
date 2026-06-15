import type { Metadata } from "next"
import "./globals.css"
import { AppProvider } from "@/context/AppContext"

export const metadata: Metadata = {
  title: "FutbolMetrics — Sistema para Academias de Fútbol",
  description: "Plataforma premium para entrenadores: registra jugadores, controla ejercicios y visualiza el progreso deportivo.",
  icons: { icon: "/favicon.svg" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
