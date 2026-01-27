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
    const { reports, total } = await ReportController.getDailyReportHistory(patientId, { limit, offset })

    // Busca o ultimo relatorio para calcular insights
    const lastReport = reports.length > 0 ? reports[0] : null
    const previousReport = reports.length > 1 ? reports[1] : null

    // Verifica se pode responder hoje
    const canSubmitNew = await ReportController.canSubmitNewDaily(patientId)

    // Calcula insights
    let insights = null
    if (lastReport) {
      let variation = null
      if (previousReport) {
        variation = ReportController.calculateDailyScoreVariation(
          lastReport.par_score,
          previousReport.par_score
        )
      }

      // Calcula streak (dias consecutivos)
      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < reports.length; i++) {
        const reportDate = new Date(reports[i].par_period_starts)
        reportDate.setHours(0, 0, 0, 0)

        const expectedDate = new Date(today)
        expectedDate.setDate(expectedDate.getDate() - i)

        // Se o ultimo report nao foi hoje, comecar do dia anterior
        if (i === 0 && !canSubmitNew) {
          // Ja respondeu hoje, entao a sequencia esta intacta
          streak++
        } else if (i === 0 && canSubmitNew) {
          // Nao respondeu hoje ainda
          expectedDate.setDate(expectedDate.getDate() - 1)
          if (reportDate.getTime() === expectedDate.getTime()) {
            streak++
          } else {
            break
          }
        } else {
          const adjustedExpected = new Date(today)
          adjustedExpected.setDate(adjustedExpected.getDate() - i - (canSubmitNew ? 1 : 0))
          if (reportDate.getTime() === adjustedExpected.getTime()) {
            streak++
          } else {
            break
          }
        }
      }

      insights = {
        lastScore: lastReport.par_score / 10, // Converte de 0-100 para 0-10
        lastDate: lastReport.par_period_starts,
        canSubmit: canSubmitNew,
        variation: variation ? {
          ...variation,
          difference: variation.difference / 10 // Converte para escala 0-10
        } : null,
        totalResponses: total,
        streak
      }
    }

    // Formata os relatorios para o frontend
    const formattedReports = reports.map(report => ({
      id: report.par_id.toString(),
      date: report.par_period_starts,
      score: report.par_score / 10, // Converte de 0-100 para 0-10
      status: report.par_status,
      clinicalResume: report.par_cli_resume
    }))

    return NextResponse.json({
      success: true,
      reports: formattedReports,
      total,
      insights,
      canSubmitNew
    })
  } catch (error) {
    console.error('[GET /api/reports/daily/history]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar historico' },
      { status: 500 }
    )
  }
}
