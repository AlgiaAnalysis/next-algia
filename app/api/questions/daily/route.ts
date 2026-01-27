import { NextResponse } from 'next/server'
import { QuestionController } from '@/controllers/Question.controller'
import { DAILY_QUESTIONNAIRE_CONFIG } from '@/constants/questionnaire'

export async function GET() {
  try {
    const questions = await QuestionController.getDailyQuestions()

    return NextResponse.json({
      success: true,
      questions,
      config: DAILY_QUESTIONNAIRE_CONFIG
    })
  } catch (error) {
    console.error('[GET /api/questions/daily]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar perguntas' },
      { status: 500 }
    )
  }
}
