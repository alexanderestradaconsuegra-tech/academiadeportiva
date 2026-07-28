import type { Translations } from "@/lib/i18n/useT"

export const calendar = {
  pageTitle: { es: "Calendario", en: "Calendar", pt: "Calendário" },
  trainingsScheduled: { es: "entrenamientos programados", en: "trainings scheduled", pt: "treinos agendados" },
  newTraining: { es: "Nuevo Entrenamiento", en: "New Training", pt: "Novo Treino" },
  editTraining: { es: "Editar Entrenamiento", en: "Edit Training", pt: "Editar Treino" },

  titleLabel: { es: "Título *", en: "Title *", pt: "Título *" },
  titlePlaceholder: { es: "Ej: Entrenamiento técnico", en: "E.g.: Technical training", pt: "Ex: Treino técnico" },
  dateLabel: { es: "Fecha *", en: "Date *", pt: "Data *" },
  timeLabel: { es: "Hora", en: "Time", pt: "Hora" },
  categoryLabel: { es: "Categoría", en: "Category", pt: "Categoria" },
  allCategories: { es: "Todas las categorías", en: "All categories", pt: "Todas as categorias" },
  locationLabel: { es: "Lugar", en: "Location", pt: "Local" },
  locationPlaceholder: { es: "Ej: Cancha 1", en: "E.g.: Field 1", pt: "Ex: Campo 1" },
  notesLabel: { es: "Notas", en: "Notes", pt: "Notas" },
  notesPlaceholder: { es: "Detalles adicionales...", en: "Additional details...", pt: "Detalhes adicionais..." },
  cancel: { es: "Cancelar", en: "Cancel", pt: "Cancelar" },
  save: { es: "Guardar", en: "Save", pt: "Salvar" },

  upcoming: { es: "Próximos", en: "Upcoming", pt: "Próximos" },
  past: { es: "Pasados", en: "Past", pt: "Anteriores" },
  noTrainingsScheduled: { es: "No hay entrenamientos programados", en: "No trainings scheduled", pt: "Nenhum treino agendado" },

  edit: { es: "Editar", en: "Edit", pt: "Editar" },
  deleteAction: { es: "Eliminar", en: "Delete", pt: "Excluir" },
  confirmDeleteTraining: { es: "¿Eliminar este entrenamiento?", en: "Delete this training?", pt: "Excluir este treino?" },

  newTrainingNotificationTitle: { es: "Nuevo entrenamiento", en: "New training", pt: "Novo treino" },

  // Attendance
  attendance: { es: "Asistencia", en: "Attendance", pt: "Presença" },
  markAttendance: { es: "Marcar asistencia", en: "Mark attendance", pt: "Marcar presença" },
  attendanceSaved: { es: "Asistencia guardada", en: "Attendance saved", pt: "Presença salva" },
  present: { es: "Presente", en: "Present", pt: "Presente" },
  absent: { es: "Ausente", en: "Absent", pt: "Ausente" },
  late: { es: "Tarde", en: "Late", pt: "Atrasado" },
  excused: { es: "Justificado", en: "Excused", pt: "Justificado" },
  noPlayersInCategory: { es: "Sin jugadores en esta categoría", en: "No players in this category", pt: "Sem jogadores nesta categoria" },
  attendanceRate: { es: "Asistencia", en: "Attendance", pt: "Presença" },
  presentCount: { es: "presentes", en: "present", pt: "presentes" },
  of: { es: "de", en: "of", pt: "de" },
  closeAttendance: { es: "Cerrar", en: "Close", pt: "Fechar" },

  // Player RSVP
  rsvpPrompt: { es: "¿Vas a entrenar?", en: "Are you coming?", pt: "Você vai treinar?" },
  iWillAttend: { es: "Sí, voy", en: "I'll be there", pt: "Vou" },
  iCannotAttend: { es: "No puedo", en: "Can't make it", pt: "Não posso" },
  yourStatus: { es: "Tu respuesta", en: "Your response", pt: "Sua resposta" },
  confirmed: { es: "confirmados", en: "confirmed", pt: "confirmados" },
  declined:  { es: "no pueden", en: "can't make it", pt: "não podem" },
  pending:   { es: "sin responder", en: "pending", pt: "sem resposta" },
} satisfies Translations
