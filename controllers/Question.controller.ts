import { prisma } from '@/lib/prisma'
import type { questions } from '@prisma/client'
import {
  QUESTION_FLAGS,
  FIQR_DOMAIN_CONFIG,
  type FIQRDomain
} from '@/constants/questionnaire'

// Re-export para manter compatibilidade
export { FIQR_DOMAIN_CONFIG }
export type QuestionDomain = FIQRDomain

export interface Question {
  id: string
  name: string
  domain: string
  index: number
}

export interface QuestionsByDomain {
  first_domain: Question[]
  second_domain: Question[]
  third_domain: Question[]
}

// Interface para perguntas do questionario diario
export interface DailyQuestion {
  id: string
  name: string
  index: number
}

export class QuestionController {
  /**
   * Busca perguntas de um dominio especifico ordenadas por indice
   */
  static async getQuestionsByDomainName(domain: QuestionDomain): Promise<questions[]> {
    return prisma.questions.findMany({
      where: { que_domain: domain },
      orderBy: { que_index: 'asc' }
    })
  }

  /**
   * Busca todas as perguntas do FIQR agrupadas por dominio
   * Busca cada dominio explicitamente para garantir a separacao correta
   */
  static async getFIQRQuestionsByDomain(): Promise<QuestionsByDomain> {
    // Busca cada dominio separadamente para garantir a correta categorizacao
    const [firstDomainQuestions, secondDomainQuestions, thirdDomainQuestions] = await Promise.all([
      this.getQuestionsByDomainName('first_domain'),
      this.getQuestionsByDomainName('second_domain'),
      this.getQuestionsByDomainName('third_domain')
    ])

    const mapQuestion = (q: questions): Question => ({
      id: q.que_id.toString(),
      name: q.que_name,
      domain: q.que_domain as QuestionDomain,
      index: q.que_index
    })

    return {
      first_domain: firstDomainQuestions.map(mapQuestion),
      second_domain: secondDomainQuestions.map(mapQuestion),
      third_domain: thirdDomainQuestions.map(mapQuestion)
    }
  }

  /**
   * Busca uma pergunta por ID
   */
  static async getQuestionById(id: bigint): Promise<questions | null> {
    return prisma.questions.findUnique({
      where: { que_id: id }
    })
  }

  /**
   * Valida se todas as perguntas obrigatorias foram respondidas
   * Retorna true se valido, ou uma mensagem de erro
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

    const unanswered = allQuestions.filter(q => answers[q.id] === null || answers[q.id] === undefined)

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
   * Busca todas as perguntas do questionario diario (micro_daily)
   * Ordenadas por indice
   */
  static async getDailyQuestions(): Promise<DailyQuestion[]> {
    const questions = await prisma.questions.findMany({
      where: { que_domain: QUESTION_FLAGS.MICRO_DAILY },
      orderBy: { que_index: 'asc' }
    })

    return questions.map((q): DailyQuestion => ({
      id: q.que_id.toString(),
      name: q.que_name,
      index: q.que_index
    }))
  }

  /**
   * Valida se todas as perguntas do questionario diario foram respondidas
   */
  static validateDailyAnswers(
    answers: Record<string, number | null>,
    questions: DailyQuestion[]
  ): { valid: boolean; error?: string } {
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
}
