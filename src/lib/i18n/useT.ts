import { useApp } from "@/context/AppContext"
import type { Language } from "@/lib/types"

export type Translations = Record<string, Record<Language, string>>

export function useT<T extends Translations>(dict: T) {
  const { language } = useApp()
  return (key: keyof T): string => dict[key][language] ?? dict[key].es
}
