import { NextResponse } from 'next/server'
import { QuestionController, FIQR_DOMAIN_CONFIG } from '@/controllers/Question.controller'

export async function GET() {
  try {
    const questions = await QuestionController.getFIQRQuestionsByDomain()

    return NextResponse.json({
      success: true,
      questions,
      domainConfig: FIQR_DOMAIN_CONFIG
    })
  } catch (error) {
    console.error('[GET /api/questions/fiqr]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar perguntas' },
      { status: 500 }
    )
  }
}
