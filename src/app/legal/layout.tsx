import Link from "next/link"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05122F]">
      <header className="bg-[#05122F] border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-metrikas.png" alt="Metrikas" className="h-10 w-auto object-contain" />
          </Link>
          <Link href="/" className="text-xs font-semibold text-blue-100/70 hover:text-white transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 sm:py-14">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10">
          {children}
        </div>
      </main>

      <footer className="max-w-3xl mx-auto px-6 pb-10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
        <p>© {new Date().getFullYear()} Metrikas · Un producto de Autix</p>
        <div className="flex items-center gap-4">
          <Link href="/legal/privacy" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacidad</Link>
          <Link href="/legal/terms" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Términos</Link>
          <a href="mailto:info@metrikas.pro" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">info@metrikas.pro</a>
        </div>
      </footer>
    </div>
  )
}
