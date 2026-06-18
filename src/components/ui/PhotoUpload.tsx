"use client"
import { useRef, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Upload } from "lucide-react"

interface PhotoUploadProps {
  folder: string
  onUploaded: (url: string) => void
}

export default function PhotoUpload({ folder, onUploaded }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setError("")
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede pesar más de 5MB.")
      return
    }
    setUploading(true)
    const ext = file.name.split(".").pop() || "jpg"
    const path = `${folder}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage.from("photos").upload(path, file, { cacheControl: "3600" })
    setUploading(false)
    if (uploadError) {
      setError("No se pudo subir la foto.")
      return
    }
    const { data } = supabase.storage.from("photos").getPublicUrl(path)
    onUploaded(data.publicUrl)
  }

  return (
    <div className="w-full">
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full h-9 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
      >
        <Upload size={13} />
        {uploading ? "Subiendo..." : "Subir foto desde el dispositivo"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  )
}
