import { prisma } from '@/lib/prisma'
import type { patient_reports, patient_domain_reports, report_answers } from '@prisma/client'
import { QuestionDomain, QuestionsByDomain, FIQR_DOMAIN_CONFIG, DailyQuestion } from './Question.controller'
import { REPORT_TYPES, DOMAIN_REPORT_TYPES } from '@/constants/questionnaire'

export interface FIQRAnswer {
  questionId: string
  value: number
}

export interface DomainScore {
  domain: QuestionDomain
  rawScore: number
  normalizedScore: number
  answersCount: number
}

export interface FIQRScoreResult {
  totalScore: number
  domainScores: {
    first_domain: DomainScore
    second_domain: DomainScore
    third_domain: DomainScore
  }
}

export interface CreateFIQRReportData {
  patientId: bigint
  answers: Record<string, number>
  questions: QuestionsByDomain
}

export interface FIQRReportResult {
  success: boolean
  report?: patient_reports
  domainReports?: patient_domain_reports[]
  scores?: FIQRScoreResult
  error?: string
}

// Interfaces para o Questionario Diario
export interface DailyScoreResult {
  score: number // Media simples (0-10)
  totalAnswers: number
  rawSum: number
}

export interface CreateDailyReportData {
  patientId: bigint
  answers: Record<string, number>
  questions: DailyQuestion[]
}

export interface DailyReportResult {
  success: boolean
  report?: patient_reports
  domainReport?: patient_domain_reports
  score?: DailyScoreResult
  error?: string
}

export class ReportController {
  /**
   * Calcula o score de um dominio especifico do FIQR
   * Formula: soma das respostas / divisor do dominio
   */
  static calculateDomainScore(
    domain: QuestionDomain,
    answers: Record<string, number>,
    questionIds: string[]
  ): DomainScore {
    const config = FIQR_DOMAIN_CONFIG[domain]

    // Soma as respostas do dominio
    let rawScore = 0
    let answersCount = 0

    for (const questionId of questionIds) {
      const value = answers[questionId]
      if (value !== undefined && value !== null) {
        rawScore += value
        answersCount++
      }
    }

    // Calcula o score normalizado
    const normalizedScore = rawScore / config.divisor

    return {
      domain,
      rawScore,
      normalizedScore: Math.round(normalizedScore * 100) / 100,
      answersCount
    }
  }

  /**
   * Calcula o score total do FIQR
   *
   * Dominios:
   * - first_domain (Funcao): 9 perguntas, score = soma / 3 (max 30 pontos)
   * - second_domain (Impacto Global): 2 perguntas, score = soma / 1 (max 20 pontos)
   * - third_domain (Sintomas): 10 perguntas, score = soma / 2 (max 50 pontos)
   *
   * Score total: 0-100 pontos (soma dos scores normalizados)
   */
  static calculateFIQRScore(
    answers: Record<string, number>,
    questions: QuestionsByDomain
  ): FIQRScoreResult {
    const firstDomainIds = questions.first_domain.map(q => q.id)
    const secondDomainIds = questions.second_domain.map(q => q.id)
    const thirdDomainIds = questions.third_domain.map(q => q.id)

    const firstDomainScore = this.calculateDomainScore('first_domain', answers, firstDomainIds)
    const secondDomainScore = this.calculateDomainScore('second_domain', answers, secondDomainIds)
    const thirdDomainScore = this.calculateDomainScore('third_domain', answers, thirdDomainIds)

    const totalScore = firstDomainScore.normalizedScore +
      secondDomainScore.normalizedScore +
      thirdDomainScore.normalizedScore

    return {
      totalScore: Math.round(totalScore * 100) / 100,
      domainScores: {
        first_domain: firstDomainScore,
        second_domain: secondDomainScore,
        third_domain: thirdDomainScore
      }
    }
  }

  /**
   * Valida as respostas do FIQR
   */
  static validateFIQRAnswers(
    answers: Record<string, number | null>,
    questions: QuestionsByDomain
  ): { valid: boolean; error?: string } {
    const allQuestions = [
      ...questions.first_domain,
      ...questions.second_domain,
      ...questions.third_domain
    ]

    // Verifica se todas as perguntas foram respondidas
    const unanswered = allQuestions.filter(
      q => answers[q.id] === null || answers[q.id] === undefined
    )

    if (unanswered.length > 0) {
      return {
        valid: false,
        error: `Existem ${unanswered.length} perguntas nao respondidas`
      }
    }

    // Valida se os valores estao dentro do range 0-10
    for (const [questionId, value] of Object.entries(answers)) {
      if (value !== null && (value < 0 || value > 10)) {
        return {
          valid: false,
          error: `Resposta invalida para a pergunta ${questionId}: valor deve estar entre 0 e 10`
        }
      }
    }

    return { valid: true }
  }

  /**
   * Cria um relatorio FIQR completo com todas as respostas
   *
   * Estrutura:
   * 1. patient_reports - relatorio principal
   * 2. patient_domain_reports - um para cada dominio (3 no total)
   * 3. report_answers - uma para cada resposta
   */
  static async createFIQRReport(data: CreateFIQRReportData): Promise<FIQRReportResult> {
    const { patientId, answers, questions } = data

    // Valida as respostas
    const validation = this.validateFIQRAnswers(answers, questions)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      }
    }

    // Converte answers para Record<string, number> (sem null)
    const validAnswers = answers as Record<string, number>

    // Calcula os scores
    const scores = this.calculateFIQRScore(validAnswers, questions)

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Cria o patient_report principal
        const now = new Date()
        const report = await tx.patient_reports.create({
          data: {
            par_period_starts: now,
            par_period_end: now,
            par_status: 'completed',
            par_medication: '',
            par_score: Math.round(scores.totalScore),
            par_cli_resume: `Score FIQR: ${scores.totalScore}/100`,
            par_type: REPORT_TYPES.FIQR,
            patient_pat_id: patientId,
            par_observation: null
          }
        })

        // 2. Cria os patient_domain_reports para cada dominio
        const domainReports: patient_domain_reports[] = []

        for (const domain of ['first_domain', 'second_domain', 'third_domain'] as QuestionDomain[]) {
          const domainScore = scores.domainScores[domain]
          const domainQuestions = questions[domain]

          const domainReport = await tx.patient_domain_reports.create({
            data: {
              pdr_domain: domain,
              pdr_score: Math.round(domainScore.normalizedScore),
              patient_report_par_id: report.par_id,
              pdr_weekday: null
            }
          })

          domainReports.push(domainReport)

          // 3. Cria os report_answers para cada pergunta do dominio
          for (const question of domainQuestions) {
            const value = validAnswers[question.id]

            await tx.report_answers.create({
              data: {
                rea_value: value,
                rea_week_day: '',
                question_que_id: BigInt(question.id),
                patient_domain_report_pdr_id: domainReport.pdr_id
              }
            })
          }
        }

        return { report, domainReports }
      })

      return {
        success: true,
        report: result.report,
        domainReports: result.domainReports,
        scores
      }
    } catch (error) {
      console.error('[ReportController.createFIQRReport]', error)
      return {
        success: false,
        error: 'Erro ao salvar o questionario. Tente novamente.'
      }
    }
  }

  /**
   * Busca o ultimo relatorio FIQR de um paciente
   */
  static async getLastFIQRReport(patientId: bigint): Promise<patient_reports | null> {
    return prisma.patient_reports.findFirst({
      where: {
        patient_pat_id: patientId,
        par_type: REPORT_TYPES.FIQR
      },
      orderBy: {
        par_period_starts: 'desc'
      }
    })
  }

  /**
   * Busca os domain reports de um relatorio
   */
  static async getDomainReports(reportId: bigint): Promise<patient_domain_reports[]> {
    return prisma.patient_domain_reports.findMany({
      where: {
        patient_report_par_id: reportId
      },
      orderBy: {
        pdr_domain: 'asc'
      }
    })
  }

  /**
   * Busca as respostas de um domain report
   */
  static async getReportAnswers(domainReportId: bigint): Promise<report_answers[]> {
    return prisma.report_answers.findMany({
      where: {
        patient_domain_report_pdr_id: domainReportId
      },
      include: {
        questions: true
      }
    })
  }

  /**
   * Busca todos os relatorios FIQR de um paciente com paginacao
   */
  static async getFIQRReportHistory(
    patientId: bigint,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ reports: patient_reports[]; total: number }> {
    const { limit = 10, offset = 0 } = options

    const [reports, total] = await Promise.all([
      prisma.patient_reports.findMany({
        where: {
          patient_pat_id: patientId,
          par_type: REPORT_TYPES.FIQR
        },
        orderBy: {
          par_period_starts: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.patient_reports.count({
        where: {
          patient_pat_id: patientId,
          par_type: REPORT_TYPES.FIQR
        }
      })
    ])

    return { reports, total }
  }

  /**
   * Busca um relatorio FIQR completo com todos os detalhes
   */
  static async getFIQRReportDetails(reportId: bigint): Promise<{
    report: patient_reports
    domainReports: (patient_domain_reports & {
      report_answers: (report_answers & { questions: { que_id: bigint; que_name: string; que_domain: string; que_index: number } })[]
    })[]
  } | null> {
    const report = await prisma.patient_reports.findUnique({
      where: { par_id: reportId }
    })

    if (!report) return null

    const domainReports = await prisma.patient_domain_reports.findMany({
      where: { patient_report_par_id: reportId },
      include: {
        report_answers: {
          include: {
            questions: true
          },
          orderBy: {
            questions: {
              que_index: 'asc'
            }
          }
        }
      },
      orderBy: {
        pdr_domain: 'asc'
      }
    })

    return { report, domainReports }
  }

  /**
   * Calcula a data do proximo FIQR baseado no ultimo respondido
   * O FIQR deve ser respondido a cada 7 dias
   */
  static getNextFIQRDate(lastReportDate: Date): Date {
    const nextDate = new Date(lastReportDate)
    nextDate.setDate(nextDate.getDate() + 7)
    return nextDate
  }

  /**
   * Verifica se o paciente pode responder um novo FIQR
   * Retorna true se ja passou o intervalo minimo (7 dias)
   */
  static canSubmitNewFIQR(lastReportDate: Date | null): boolean {
    if (!lastReportDate) return true

    const nextDate = this.getNextFIQRDate(lastReportDate)
    return new Date() >= nextDate
  }

  /**
   * Calcula a variacao entre dois scores
   */
  static calculateScoreVariation(currentScore: number, previousScore: number): {
    difference: number
    percentage: number
    trend: 'improved' | 'worsened' | 'stable'
  } {
    const difference = currentScore - previousScore
    const percentage = previousScore !== 0
      ? Math.round((difference / previousScore) * 100)
      : 0

    let trend: 'improved' | 'worsened' | 'stable' = 'stable'
    if (difference < -5) trend = 'improved' // Score menor = melhora
    else if (difference > 5) trend = 'worsened' // Score maior = piora

    return { difference, percentage, trend }
  }

  // =============================================
  // METODOS DO QUESTIONARIO DIARIO
  // =============================================

  /**
   * Calcula o score do questionario diario (media simples)
   */
  static calculateDailyScore(
    answers: Record<string, number>,
    questions: DailyQuestion[]
  ): DailyScoreResult {
    let rawSum = 0
    let totalAnswers = 0

    for (const question of questions) {
      const value = answers[question.id]
      if (value !== undefined && value !== null) {
        rawSum += value
        totalAnswers++
      }
    }

    // Media simples
    const score = totalAnswers > 0
      ? Math.round((rawSum / totalAnswers) * 100) / 100
      : 0

    return {
      score,
      totalAnswers,
      rawSum
    }
  }

  /**
   * Valida as respostas do questionario diario
   */
  static validateDailyAnswers(
    answers: Record<string, number | null>,
    questions: DailyQuestion[]
  ): { valid: boolean; error?: string } {
    // Verifica se todas as perguntas foram respondidas
    const unanswered = questions.filter(
      q => answers[q.id] === null || answers[q.id] === undefined
    )

    if (unanswered.length > 0) {
      return {
        valid: false,
        error: `Existem ${unanswered.length} perguntas nao respondidas`
      }
    }

    // Valida se os valores estao dentro do range 0-10
    for (const [questionId, value] of Object.entries(answers)) {
      if (value !== null && (value < 0 || value > 10)) {
        return {
          valid: false,
          error: `Resposta invalida para a pergunta ${questionId}: valor deve estar entre 0 e 10`
        }
      }
    }

    return { valid: true }
  }

  /**
   * Cria um relatorio do questionario diario
   *
   * Estrutura:
   * 1. patient_reports - relatorio principal com par_type = 'domain_daily'
   * 2. patient_domain_reports - um unico com pdr_domain = 'daily_domain'
   * 3. report_answers - uma para cada resposta
   *
   * O score do patient_reports e igual ao score do patient_domain_reports (media simples)
   */
  static async createDailyReport(data: CreateDailyReportData): Promise<DailyReportResult> {
    const { patientId, answers, questions } = data

    // Valida as respostas
    const validation = this.validateDailyAnswers(answers, questions)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      }
    }

    // Converte answers para Record<string, number> (sem null)
    const validAnswers = answers as Record<string, number>

    // Calcula o score (media simples)
    const scoreResult = this.calculateDailyScore(validAnswers, questions)

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Cria o patient_report principal
        const now = new Date()
        const report = await tx.patient_reports.create({
          data: {
            par_period_starts: now,
            par_period_end: now,
            par_status: 'completed',
            par_medication: '',
            par_score: Math.round(scoreResult.score * 10), // Armazena como inteiro (0-100)
            par_cli_resume: `Score Diario: ${scoreResult.score}/10`,
            par_type: REPORT_TYPES.DOMAIN_DAILY,
            patient_pat_id: patientId,
            par_observation: null
          }
        })

        // 2. Cria o patient_domain_report unico
        const domainReport = await tx.patient_domain_reports.create({
          data: {
            pdr_domain: DOMAIN_REPORT_TYPES.DAILY_DOMAIN,
            pdr_score: Math.round(scoreResult.score * 10), // Mesmo score do report principal
            patient_report_par_id: report.par_id,
            pdr_weekday: now.toLocaleDateString('pt-BR', { weekday: 'long' })
          }
        })

        // 3. Cria os report_answers para cada pergunta
        for (const question of questions) {
          const value = validAnswers[question.id]

          await tx.report_answers.create({
            data: {
              rea_value: value,
              rea_week_day: now.toLocaleDateString('pt-BR', { weekday: 'long' }),
              question_que_id: BigInt(question.id),
              patient_domain_report_pdr_id: domainReport.pdr_id
            }
          })
        }

        return { report, domainReport }
      })

      return {
        success: true,
        report: result.report,
        domainReport: result.domainReport,
        score: scoreResult
      }
    } catch (error) {
      console.error('[ReportController.createDailyReport]', error)
      return {
        success: false,
        error: 'Erro ao salvar o questionario. Tente novamente.'
      }
    }
  }

  /**
   * Busca o ultimo relatorio diario de um paciente
   */
  static async getLastDailyReport(patientId: bigint): Promise<patient_reports | null> {
    return prisma.patient_reports.findFirst({
      where: {
        patient_pat_id: patientId,
        par_type: REPORT_TYPES.DOMAIN_DAILY
      },
      orderBy: {
        par_period_starts: 'desc'
      }
    })
  }

  /**
   * Busca todos os relatorios diarios de um paciente com paginacao
   */
  static async getDailyReportHistory(
    patientId: bigint,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ reports: patient_reports[]; total: number }> {
    const { limit = 10, offset = 0 } = options

    const [reports, total] = await Promise.all([
      prisma.patient_reports.findMany({
        where: {
          patient_pat_id: patientId,
          par_type: REPORT_TYPES.DOMAIN_DAILY
        },
        orderBy: {
          par_period_starts: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.patient_reports.count({
        where: {
          patient_pat_id: patientId,
          par_type: REPORT_TYPES.DOMAIN_DAILY
        }
      })
    ])

    return { reports, total }
  }

  /**
   * Busca um relatorio diario completo com todos os detalhes
   */
  static async getDailyReportDetails(reportId: bigint): Promise<{
    report: patient_reports
    domainReport: (patient_domain_reports & {
      report_answers: (report_answers & { questions: { que_id: bigint; que_name: string; que_domain: string; que_index: number } })[]
    }) | null
  } | null> {
    const report = await prisma.patient_reports.findUnique({
      where: { par_id: reportId }
    })

    if (!report) return null

    const domainReport = await prisma.patient_domain_reports.findFirst({
      where: {
        patient_report_par_id: reportId,
        pdr_domain: DOMAIN_REPORT_TYPES.DAILY_DOMAIN
      },
      include: {
        report_answers: {
          include: {
            questions: true
          },
          orderBy: {
            questions: {
              que_index: 'asc'
            }
          }
        }
      }
    })

    return { report, domainReport }
  }

  /**
   * Verifica se o paciente ja respondeu o questionario diario hoje
   */
  static async hasSubmittedDailyToday(patientId: bigint): Promise<boolean> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const report = await prisma.patient_reports.findFirst({
      where: {
        patient_pat_id: patientId,
        par_type: REPORT_TYPES.DOMAIN_DAILY,
        par_period_starts: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    return report !== null
  }

  /**
   * Verifica se o paciente pode responder um novo questionario diario
   * (apenas 1 por dia)
   */
  static async canSubmitNewDaily(patientId: bigint): Promise<boolean> {
    const hasSubmittedToday = await this.hasSubmittedDailyToday(patientId)
    return !hasSubmittedToday
  }

  /**
   * Calcula a variacao do score diario (threshold menor para diario)
   */
  static calculateDailyScoreVariation(currentScore: number, previousScore: number): {
    difference: number
    percentage: number
    trend: 'improved' | 'worsened' | 'stable'
  } {
    const difference = currentScore - previousScore
    const percentage = previousScore !== 0
      ? Math.round((difference / previousScore) * 100)
      : 0

    // Threshold menor para diario (0.5 pontos)
    let trend: 'improved' | 'worsened' | 'stable' = 'stable'
    if (difference < -5) trend = 'improved' // Score menor = melhora (armazenado como 0-100)
    else if (difference > 5) trend = 'worsened' // Score maior = piora

    return { difference, percentage, trend }
  }
}
