import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { QuestionController } from '@/controllers/Question.controller'
import { ReportController } from '@/controllers/Report.controller'

interface SessionData {
  id: string
  name: string | null
  email: string | null
  role: string
  representedAgentId: number | null
}

export async function POST(request: NextRequest) {
  try {
    // Verifica a sessao do usuario
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Usuario nao autenticado' },
        { status: 401 }
      )
    }

    let session: SessionData
    try {
      session = JSON.parse(sessionCookie.value)
    } catch {
      return NextResponse.json(
        { error: 'Sessao invalida' },
        { status: 401 }
      )
    }

    // Verifica se e um paciente
    if (session.role !== 'patient') {
      return NextResponse.json(
        { error: 'Apenas pacientes podem responder o questionario diario' },
        { status: 403 }
      )
    }

    // Verifica se tem o ID do paciente
    if (!session.representedAgentId) {
      return NextResponse.json(
        { error: 'ID do paciente nao encontrado' },
        { status: 400 }
      )
    }

    const patientId = BigInt(session.representedAgentId)

    // Verifica se ja respondeu hoje
    const canSubmit = await ReportController.canSubmitNewDaily(patientId)
    if (!canSubmit) {
      return NextResponse.json(
        { error: 'Voce ja respondeu o questionario diario hoje. Volte amanha!' },
        { status: 400 }
      )
    }

    // Parse do body
    const body = await request.json()
    const { answers } = body

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Respostas invalidas' },
        { status: 400 }
      )
    }

    // Busca as perguntas para validacao
    const questions = await QuestionController.getDailyQuestions()

    // Valida as respostas
    const validation = ReportController.validateDailyAnswers(answers, questions)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Cria o relatorio
    const result = await ReportController.createDailyReport({
      patientId,
      answers,
      questions
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Questionario diario salvo com sucesso',
      score: result.score,
      reportId: result.report?.par_id.toString()
    })
  } catch (error) {
    console.error('[POST /api/reports/daily]', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
