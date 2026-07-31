"use client"

import { useState } from "react"
import { X, Mail, Building2, Loader2, CheckCircle2 } from "lucide-react"

interface DemoRequestModalProps {
  open: boolean
  onClose: () => void
}

export default function DemoRequestModal({ open, onClose }: DemoRequestModalProps) {
  const [email, setEmail] = useState("")
  const [academyName, setAcademyName] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/demo/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, academy_name: academyName }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al solicitar demo")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setEmail("")
        setAcademyName("")
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError("Error de conexión. Intenta de nuevo.")
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-400 to-green-300 p-6 text-[#05122F]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#05122F] hover:bg-green-200 p-1 rounded-full transition"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-black">🎁 Solicitar Demo</h2>
          <p className="text-sm opacity-90 mt-1">14 días gratis — Acceso completo</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#05122F] mb-2">¡Listo!</h3>
              <p className="text-gray-600 text-sm">
                Revisa tu email <strong>{email}</strong> para obtener tu código de demo.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#05122F] mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Tu email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none text-sm text-gray-900"
                />
              </div>

              {/* Academia Name */}
              <div>
                <label className="block text-sm font-semibold text-[#05122F] mb-2">
                  <Building2 size={16} className="inline mr-2" />
                  Nombre de tu academia
                </label>
                <input
                  type="text"
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  placeholder="Mi Academia Deportiva"
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-green-400 focus:outline-none text-sm text-gray-900"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Features */}
              <div className="bg-green-50 rounded-lg p-4 mt-6">
                <p className="text-xs font-semibold text-[#05122F] mb-2">Tu demo incluye:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>✅ Jugadores ilimitados</li>
                  <li>✅ Evaluaciones y gráficas</li>
                  <li>✅ Convocatorias y tácticas</li>
                  <li>✅ Pagos automáticos</li>
                  <li>✅ TODO SIN RESTRICCIONES</li>
                </ul>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-400 to-green-300 text-[#05122F] font-bold py-3 rounded-lg hover:from-green-300 hover:to-green-200 transition-all disabled:opacity-50 mt-6 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    🎁 Enviar código a mi email
                  </>
                )}
              </button>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Recibirás tu código de demo por email en segundos.
                <br />
                Válido por 14 días.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
