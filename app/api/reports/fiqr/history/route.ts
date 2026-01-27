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

export async function GET(request: NextRequest) {
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

    const patientId = BigInt(session.representedAgentId)

    // Busca parametros de paginacao
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Busca historico
    const { reports, total } = await ReportController.getFIQRReportHistory(patientId, { limit, offset })

    // Busca o ultimo relatorio para calcular insights
    const lastReport = reports.length > 0 ? reports[0] : null
    const previousReport = reports.length > 1 ? reports[1] : null

    // Calcula insights
    let insights = null
    if (lastReport) {
      const nextFIQRDate = ReportController.getNextFIQRDate(lastReport.par_period_starts)
      const canSubmit = ReportController.canSubmitNewFIQR(lastReport.par_period_starts)

      let variation = null
      if (previousReport) {
        variation = ReportController.calculateScoreVariation(
          lastReport.par_score,
          previousReport.par_score
        )
      }

      insights = {
        lastScore: lastReport.par_score,
        lastDate: lastReport.par_period_starts,
        nextFIQRDate,
        canSubmit,
        daysUntilNext: Math.max(0, Math.ceil((nextFIQRDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
        variation,
        totalResponses: total
      }
    }

    // Formata os relatorios para o frontend
    const formattedReports = reports.map(report => ({
      id: report.par_id.toString(),
      date: report.par_period_starts,
      score: report.par_score,
      status: report.par_status,
      clinicalResume: report.par_cli_resume
    }))

    return NextResponse.json({
      success: true,
      reports: formattedReports,
      total,
      insights,
      canSubmitNew: lastReport ? ReportController.canSubmitNewFIQR(lastReport.par_period_starts) : true
    })
  } catch (error) {
    console.error('[GET /api/reports/fiqr/history]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar historico' },
      { status: 500 }
    )
  }
}
