/**
 * Constantes para os tipos de questionarios e relatorios
 * Centralizado para evitar erros de digitacao nas consultas
 */

// Flags de perguntas (que_domain na tabela questions)
export const QUESTION_FLAGS = {
  // FIQR - Questionario de Impacto da Fibromialgia
  FIQR_FIRST_DOMAIN: 'first_domain',
  FIQR_SECOND_DOMAIN: 'second_domain',
  FIQR_THIRD_DOMAIN: 'third_domain',

  // Questionario Diario
  MICRO_DAILY: 'micro_daily'
} as const

// Tipos de relatorio (par_type na tabela patient_reports)
export const REPORT_TYPES = {
  FIQR: 'fiqr',
  DOMAIN_DAILY: 'domain_daily'
} as const

// Tipos de dominio de relatorio (pdr_domain na tabela patient_domain_reports)
export const DOMAIN_REPORT_TYPES = {
  // FIQR
  FIQR_FIRST_DOMAIN: 'first_domain',
  FIQR_SECOND_DOMAIN: 'second_domain',
  FIQR_THIRD_DOMAIN: 'third_domain',

  // Questionario Diario
  DAILY_DOMAIN: 'daily_domain'
} as const

// Configuracao do FIQR
export const FIQR_DOMAIN_CONFIG = {
  first_domain: {
    name: 'Funcao',
    expectedQuestions: 9,
    divisor: 3,
    maxScore: 30
  },
  second_domain: {
    name: 'Impacto Global',
    expectedQuestions: 2,
    divisor: 1,
    maxScore: 20
  },
  third_domain: {
    name: 'Sintomas',
    expectedQuestions: 10,
    divisor: 2,
    maxScore: 50
  }
} as const

// Configuracao do Questionario Diario
export const DAILY_QUESTIONNAIRE_CONFIG = {
  name: 'Questionario Diario',
  description: 'Acompanhamento diario de sintomas',
  maxScore: 10, // Media de 0 a 10
  canSubmitSameDay: false // Apenas 1 por dia
} as const

// Types
export type QuestionFlag = typeof QUESTION_FLAGS[keyof typeof QUESTION_FLAGS]
export type ReportType = typeof REPORT_TYPES[keyof typeof REPORT_TYPES]
export type DomainReportType = typeof DOMAIN_REPORT_TYPES[keyof typeof DOMAIN_REPORT_TYPES]
export type FIQRDomain = 'first_domain' | 'second_domain' | 'third_domain'
