import type { Translations } from "@/lib/i18n/useT"

export const payments = {
  pageTitle: { es: "Pagos", en: "Payments", pt: "Pagamentos" },
  paymentsRegistered: { es: "cobros registrados", en: "payments registered", pt: "cobranças registradas" },
  newPayment: { es: "Nuevo cobro", en: "New payment", pt: "Novo cobro" },
  newPaymentTitle: { es: "Registrar Cobro", en: "Register Payment", pt: "Registrar Cobro" },
  editPayment: { es: "Editar Cobro", en: "Edit Payment", pt: "Editar Cobro" },

  // Summary tiles
  overduePayments: { es: "Vencidos", en: "Overdue", pt: "Vencidos" },
  pendingPayments: { es: "Pendientes", en: "Pending", pt: "Pendentes" },
  collectedThisMonth: { es: "Cobrado este mes", en: "Collected this month", pt: "Cobrado este mês" },
  players: { es: "alumnos", en: "students", pt: "alunos" },

  // Filters
  allStatus: { es: "Todos", en: "All", pt: "Todos" },
  allConcepts: { es: "Todos los conceptos", en: "All concepts", pt: "Todos os conceitos" },
  allPlayers: { es: "Todos los alumnos", en: "All students", pt: "Todos os alunos" },

  // Status labels
  statusPending: { es: "Pendiente", en: "Pending", pt: "Pendente" },
  statusPaid: { es: "Pagado", en: "Paid", pt: "Pago" },
  statusOverdue: { es: "Vencido", en: "Overdue", pt: "Vencido" },

  // Concepts
  monthlyFee: { es: "Mensualidad", en: "Monthly fee", pt: "Mensalidade" },
  enrollment: { es: "Matrícula", en: "Enrollment", pt: "Matrícula" },
  uniform: { es: "Uniforme", en: "Uniform", pt: "Uniforme" },
  tournament: { es: "Torneo", en: "Tournament", pt: "Torneio" },
  otherConcept: { es: "Otro", en: "Other", pt: "Outro" },

  // Form fields
  playerLabel: { es: "Alumno *", en: "Student *", pt: "Aluno *" },
  conceptLabel: { es: "Concepto *", en: "Concept *", pt: "Conceito *" },
  amountLabel: { es: "Monto *", en: "Amount *", pt: "Valor *" },
  dueDateLabel: { es: "Fecha de vencimiento *", en: "Due date *", pt: "Data de vencimento *" },
  paidDateLabel: { es: "Fecha de pago", en: "Payment date", pt: "Data de pagamento" },
  notesLabel: { es: "Notas", en: "Notes", pt: "Notas" },
  notesPlaceholder: { es: "Detalles adicionales...", en: "Additional details...", pt: "Detalhes adicionais..." },

  // Actions
  markPaid: { es: "Marcar pagado", en: "Mark paid", pt: "Marcar pago" },
  cancel: { es: "Cancelar", en: "Cancel", pt: "Cancelar" },
  save: { es: "Guardar", en: "Save", pt: "Salvar" },
  delete: { es: "Eliminar", en: "Delete", pt: "Excluir" },
  confirmDelete: { es: "¿Eliminar este cobro?", en: "Delete this payment?", pt: "Excluir este cobro?" },

  // Empty / no data
  noPayments: { es: "Sin cobros registrados", en: "No payments registered", pt: "Nenhum cobro registrado" },
  noPaymentsMatch: { es: "No hay cobros que coincidan con los filtros", en: "No payments match the filters", pt: "Nenhum cobro corresponde aos filtros" },

  // Player profile card
  paymentStatus: { es: "Estado de pagos", en: "Payment status", pt: "Estado de pagamentos" },
  upToDate: { es: "Al día", en: "Up to date", pt: "Em dia" },
  owesMonths: { es: "cuota(s) vencida(s)", en: "overdue payment(s)", pt: "cobro(s) vencido(s)" },
  overdueAmount: { es: "Monto vencido", en: "Overdue amount", pt: "Valor vencido" },
  viewPayments: { es: "Ver pagos →", en: "View payments →", pt: "Ver pagamentos →" },

  // Dashboard widget
  paymentAlert: { es: "Alertas de pago", en: "Payment alerts", pt: "Alertas de pagamento" },
  studentsOverdue: { es: "alumnos con pagos vencidos", en: "students with overdue payments", pt: "alunos com pagamentos vencidos" },
} satisfies Translations
