'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  ArrowLeft,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronRight,
  Plus,
  X,
  Loader2,
  BarChart3,
  Minus,
  Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SimpleAnimatedBackground } from '@/components/shared/SimpleAnimatedBackground'

interface DailyReport {
  id: string
  date: string
  score: number
  status: string
  clinicalResume: string
}

interface Variation {
  difference: number
  percentage: number
  trend: 'improved' | 'worsened' | 'stable'
}

interface Insights {
  lastScore: number
  lastDate: string
  canSubmit: boolean
  variation: Variation | null
  totalResponses: number
  streak: number
}

interface ReportAnswer {
  questionId: string
  questionName: string
  questionIndex: number
  value: number
}

interface ReportDetails {
  id: string
  date: string
  score: number
  status: string
  clinicalResume: string
  observation: string | null
  weekday: string | null
  answers: ReportAnswer[]
}

function getScoreLevel(score: number) {
  if (score <= 3) return { label: 'Leve', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' }
  if (score <= 5) return { label: 'Moderado', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' }
  if (score <= 7) return { label: 'Elevado', color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' }
  return { label: 'Intenso', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function formatDateLong(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

function ReportCard({
  report,
  onClick
}: {
  report: DailyReport
  onClick: () => void
}) {
  const level = getScoreLevel(report.score)

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', level.bg)}>
            <span className={cn('text-lg font-bold', level.color)}>{report.score.toFixed(1)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-800">{formatDate(report.date)}</p>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', level.bg, level.color)}>
                {level.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Score: {report.score.toFixed(1)}/10</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
      </div>
    </button>
  )
}

function ReportDetailsModal({
  report,
  onClose
}: {
  report: ReportDetails
  onClose: () => void
}) {
  const level = getScoreLevel(report.score)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', level.bg)}>
                <Activity className={cn('h-6 w-6', level.color)} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Detalhes do Diario</h2>
                <p className="text-sm text-slate-500">{formatDateLong(report.date)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Score Summary */}
          <div className={cn('rounded-xl p-4 mb-6', level.bg, level.border, 'border')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Score do Dia</p>
                <div className="flex items-baseline gap-2">
                  <span className={cn('text-3xl font-bold', level.color)}>{report.score.toFixed(1)}</span>
                  <span className="text-slate-400">/10</span>
                </div>
              </div>
              <span className={cn('px-3 py-1.5 rounded-lg text-sm font-semibold', level.bg, level.color)}>
                {level.label}
              </span>
            </div>
          </div>

          {/* Answers */}
          <div>
            <h3 className="font-semibold text-slate-700 mb-3">Suas Respostas</h3>
            <div className="space-y-2">
              {report.answers
                .sort((a, b) => a.questionIndex - b.questionIndex)
                .map((answer) => (
                  <div
                    key={answer.questionId}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <p className="text-sm text-slate-600 flex-1 pr-4">{answer.questionName}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                          <div
                            key={val}
                            className={cn(
                              'w-2 h-4 rounded-sm',
                              val <= answer.value
                                ? 'bg-blue-400'
                                : 'bg-slate-200'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold min-w-[2rem] text-right text-blue-600">
                        {answer.value}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DailyHistoryPage() {
  const [reports, setReports] = useState<DailyReport[]>([])
  const [insights, setInsights] = useState<Insights | null>(null)
  const [canSubmitNew, setCanSubmitNew] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [reportDetails, setReportDetails] = useState<ReportDetails | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch('/api/reports/daily/history')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao carregar historico')
        }

        setReports(data.reports)
        setInsights(data.insights)
        setCanSubmitNew(data.canSubmitNew)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar historico')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const handleOpenDetails = async (reportId: string) => {
    setSelectedReportId(reportId)
    setIsLoadingDetails(true)

    try {
      const response = await fetch(`/api/reports/daily/${reportId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar detalhes')
      }

      setReportDetails(data.report)
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleCloseDetails = () => {
    setSelectedReportId(null)
    setReportDetails(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SimpleAnimatedBackground />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-pulse shadow-lg shadow-blue-200">
              <Activity className="h-7 w-7 text-white" />
            </div>
            <p className="text-blue-500 animate-pulse">Carregando historico...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <SimpleAnimatedBackground />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-red-200 p-6 max-w-md w-full text-center">
            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Erro ao carregar</h2>
            <p className="text-slate-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hasReports = reports.length > 0

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleAnimatedBackground />

      {/* Report Details Modal */}
      {selectedReportId && (
        isLoadingDetails ? (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="text-slate-600">Carregando detalhes...</p>
            </div>
          </div>
        ) : reportDetails && (
          <ReportDetailsModal report={reportDetails} onClose={handleCloseDetails} />
        )
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-blue-100 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/patient/dashboard"
                className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">Diario</h1>
                <p className="text-xs text-blue-500">Acompanhamento diario de sintomas</p>
              </div>
            </div>

            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Insights Section */}
        {hasReports && insights ? (
          <>
            {/* Last Score Card */}
            <div className="mb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'h-16 w-16 rounded-xl flex items-center justify-center',
                      getScoreLevel(insights.lastScore).bg
                    )}>
                      <span className={cn('text-2xl font-bold', getScoreLevel(insights.lastScore).color)}>
                        {insights.lastScore.toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Ultimo Score</p>
                      <p className="text-xl font-bold text-slate-800">{insights.lastScore.toFixed(1)}/10</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          getScoreLevel(insights.lastScore).bg,
                          getScoreLevel(insights.lastScore).color
                        )}>
                          {getScoreLevel(insights.lastScore).label}
                        </span>
                        <span className="text-xs text-slate-400">{formatDate(insights.lastDate)}</span>
                      </div>
                    </div>
                  </div>

                  {insights.variation && (
                    <div className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg',
                      insights.variation.trend === 'improved' && 'bg-green-50',
                      insights.variation.trend === 'worsened' && 'bg-red-50',
                      insights.variation.trend === 'stable' && 'bg-slate-50'
                    )}>
                      {insights.variation.trend === 'improved' && <TrendingDown className="h-5 w-5 text-green-600" />}
                      {insights.variation.trend === 'worsened' && <TrendingUp className="h-5 w-5 text-red-600" />}
                      {insights.variation.trend === 'stable' && <Minus className="h-5 w-5 text-slate-600" />}
                      <div>
                        <p className={cn(
                          'text-sm font-semibold',
                          insights.variation.trend === 'improved' && 'text-green-700',
                          insights.variation.trend === 'worsened' && 'text-red-700',
                          insights.variation.trend === 'stable' && 'text-slate-700'
                        )}>
                          {insights.variation.trend === 'improved' && 'Melhora'}
                          {insights.variation.trend === 'worsened' && 'Piora'}
                          {insights.variation.trend === 'stable' && 'Estavel'}
                        </p>
                        <p className={cn(
                          'text-xs',
                          insights.variation.trend === 'improved' && 'text-green-600',
                          insights.variation.trend === 'worsened' && 'text-red-600',
                          insights.variation.trend === 'stable' && 'text-slate-500'
                        )}>
                          {insights.variation.difference > 0 ? '+' : ''}{insights.variation.difference.toFixed(1)} pontos
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-800">{insights.totalResponses}</p>
                <p className="text-sm text-slate-500">Questionarios</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Flame className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-800">{insights.streak}</p>
                <p className="text-sm text-slate-500">Dias seguidos</p>
              </div>

              <div className={cn(
                'bg-white/80 backdrop-blur-sm rounded-xl border p-4',
                canSubmitNew ? 'border-green-200' : 'border-slate-200'
              )}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center',
                    canSubmitNew ? 'bg-green-100' : 'bg-slate-100'
                  )}>
                    <Calendar className={cn('h-5 w-5', canSubmitNew ? 'text-green-600' : 'text-slate-500')} />
                  </div>
                </div>
                {canSubmitNew ? (
                  <>
                    <p className="text-lg font-bold text-green-700">Disponivel</p>
                    <p className="text-sm text-green-600">Pronto</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-slate-800">Respondido</p>
                    <p className="text-sm text-slate-500">Volte amanha</p>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="mb-6 p-8 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Nenhum diario respondido</h3>
            <p className="text-blue-600 mb-4">
              Responda seu primeiro questionario diario para comecar a acompanhar seus sintomas.
            </p>
          </div>
        )}

        {/* Action Button */}
        <Link
          href={canSubmitNew ? '/patient/questionnaire/daily/new' : '#'}
          className={cn(
            'flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold text-lg transition-all mb-6',
            canSubmitNew
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-200'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          )}
          onClick={(e) => !canSubmitNew && e.preventDefault()}
        >
          <Plus className="h-5 w-5" />
          {hasReports ? 'Responder Diario de Hoje' : 'Responder Primeiro Diario'}
        </Link>

        {/* History Section */}
        {hasReports && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Historico</h2>
              <span className="text-sm text-slate-500">{reports.length} registros</span>
            </div>

            <div className="space-y-3">
              {reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onClick={() => handleOpenDetails(report.id)}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
