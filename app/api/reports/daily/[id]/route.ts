import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ReportController } from '@/controllers/Report.controller'

interface SessionData {
  id: string
  name: string | null
  email: string | null
  role: string
  representedAgentId: number | null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    if (session.role !== 'patient') {
      return NextResponse.json(
        { error: 'Acesso nao autorizado' },
        { status: 403 }
      )
    }

    if (!session.representedAgentId) {
      return NextResponse.json(
        { error: 'ID do paciente nao encontrado' },
        { status: 400 }
      )
    }

    // Busca os detalhes do relatorio
    const reportId = BigInt(id)
    const details = await ReportController.getDailyReportDetails(reportId)

    if (!details) {
      return NextResponse.json(
        { error: 'Relatorio nao encontrado' },
        { status: 404 }
      )
    }

    // Verifica se o relatorio pertence ao paciente
    if (details.report.patient_pat_id !== BigInt(session.representedAgentId)) {
      return NextResponse.json(
        { error: 'Acesso nao autorizado a este relatorio' },
        { status: 403 }
      )
    }

    // Formata os dados para o frontend
    const formattedReport = {
      id: details.report.par_id.toString(),
      date: details.report.par_period_starts,
      score: details.report.par_score / 10, // Converte de 0-100 para 0-10
      status: details.report.par_status,
      clinicalResume: details.report.par_cli_resume,
      observation: details.report.par_observation,
      weekday: details.domainReport?.pdr_weekday || null,
      answers: details.domainReport?.report_answers.map(ra => ({
        questionId: ra.question_que_id.toString(),
        questionName: ra.questions.que_name,
        questionIndex: ra.questions.que_index,
        value: ra.rea_value
      })) || []
    }

    return NextResponse.json({
      success: true,
      report: formattedReport
    })
  } catch (error) {
    console.error('[GET /api/reports/daily/[id]]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes do relatorio' },
      { status: 500 }
    )
  }
}
