import type { Translations } from "@/lib/i18n/useT"

export const misc = {
  somethingWentWrong: { es: "Algo salió mal", en: "Something went wrong", pt: "Algo deu errado" },
  unexpectedErrorMessage: {
    es: "Ocurrió un error inesperado. Intenta de nuevo, si sigue pasando avísale al entrenador.",
    en: "An unexpected error occurred. Try again, and if it keeps happening let the coach know.",
    pt: "Ocorreu um erro inesperado. Tente novamente, se persistir avise o treinador.",
  },
  tryAgain: { es: "Intentar de nuevo", en: "Try again", pt: "Tentar novamente" },
  pageNotFound: { es: "Página no encontrada", en: "Page not found", pt: "Página não encontrada" },
  pageNotFoundMessage: {
    es: "La página que buscas no existe o fue movida.",
    en: "The page you're looking for doesn't exist or was moved.",
    pt: "A página que você procura não existe ou foi movida.",
  },
  backToHome: { es: "Volver al inicio", en: "Back to home", pt: "Voltar ao início" },
  loading: { es: "Cargando...", en: "Loading...", pt: "Carregando..." },
} satisfies Translations
