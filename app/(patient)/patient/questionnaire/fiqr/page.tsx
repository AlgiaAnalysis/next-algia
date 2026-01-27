'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  HeartPulse,
  ArrowLeft,
  FileText,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  X,
  Loader2,
  Activity,
  BarChart3,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SimpleAnimatedBackground } from '@/components/shared/SimpleAnimatedBackground'

interface FIQRReport {
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
  nextFIQRDate: string
  canSubmit: boolean
  daysUntilNext: number
  variation: Variation | null
  totalResponses: number
}

interface ReportDomain {
  domain: string
  score: number
  answers: {
    questionId: string
    questionName: string
    questionIndex: number
    value: number
  }[]
}

interface ReportDetails {
  id: string
  date: string
  score: number
  status: string
  clinicalResume: string
  observation: string | null
  domains: ReportDomain[]
}

const domainLabels: Record<string, { name: string; color: string; maxScore: number }> = {
  first_domain: { name: 'Funcao', color: 'purple', maxScore: 30 },
  second_domain: { name: 'Impacto Global', color: 'blue', maxScore: 20 },
  third_domain: { name: 'Sintomas', color: 'emerald', maxScore: 50 }
}

function getScoreLevel(score: number) {
  if (score <= 25) return { label: 'Leve', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' }
  if (score <= 50) return { label: 'Moderado', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' }
  if (score <= 75) return { label: 'Severo', color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' }
  return { label: 'Muito Severo', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' }
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
  report: FIQRReport
  onClick: () => void
}) {
  const level = getScoreLevel(report.score)

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-4 hover:border-purple-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', level.bg)}>
            <span className={cn('text-lg font-bold', level.color)}>{report.score}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-800">{formatDate(report.date)}</p>
              <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', level.bg, level.color)}>
                {level.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Score: {report.score}/100</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center', level.bg)}>
                <FileText className={cn('h-6 w-6', level.color)} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Detalhes do FIQR</h2>
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
                <p className="text-sm text-slate-600 mb-1">Score Total</p>
                <div className="flex items-baseline gap-2">
                  <span className={cn('text-3xl font-bold', level.color)}>{report.score}</span>
                  <span className="text-slate-400">/100</span>
                </div>
              </div>
              <span className={cn('px-3 py-1.5 rounded-lg text-sm font-semibold', level.bg, level.color)}>
                {level.label}
              </span>
            </div>
          </div>

          {/* Domain Scores */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {report.domains.map((domain) => {
              const domainInfo = domainLabels[domain.domain]
              return (
                <div
                  key={domain.domain}
                  className={cn(
                    'text-center p-3 rounded-lg',
                    domainInfo.color === 'purple' && 'bg-purple-50',
                    domainInfo.color === 'blue' && 'bg-blue-50',
                    domainInfo.color === 'emerald' && 'bg-emerald-50'
                  )}
                >
                  <p className={cn(
                    'text-xs mb-1',
                    domainInfo.color === 'purple' && 'text-purple-600',
                    domainInfo.color === 'blue' && 'text-blue-600',
                    domainInfo.color === 'emerald' && 'text-emerald-600'
                  )}>
                    {domainInfo.name}
                  </p>
                  <p className={cn(
                    'text-lg font-semibold',
                    domainInfo.color === 'purple' && 'text-purple-700',
                    domainInfo.color === 'blue' && 'text-blue-700',
                    domainInfo.color === 'emerald' && 'text-emerald-700'
                  )}>
                    {domain.score}
                  </p>
                  <p className={cn(
                    'text-xs',
                    domainInfo.color === 'purple' && 'text-purple-400',
                    domainInfo.color === 'blue' && 'text-blue-400',
                    domainInfo.color === 'emerald' && 'text-emerald-400'
                  )}>
                    /{domainInfo.maxScore}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Answers by Domain */}
          {report.domains.map((domain) => {
            const domainInfo = domainLabels[domain.domain]
            return (
              <div key={domain.domain} className="mb-6 last:mb-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    'h-6 w-6 rounded-lg flex items-center justify-center',
                    domainInfo.color === 'purple' && 'bg-purple-100',
                    domainInfo.color === 'blue' && 'bg-blue-100',
                    domainInfo.color === 'emerald' && 'bg-emerald-100'
                  )}>
                    <Activity className={cn(
                      'h-3.5 w-3.5',
                      domainInfo.color === 'purple' && 'text-purple-600',
                      domainInfo.color === 'blue' && 'text-blue-600',
                      domainInfo.color === 'emerald' && 'text-emerald-600'
                    )} />
                  </div>
                  <h3 className="font-semibold text-slate-700">{domainInfo.name}</h3>
                </div>

                <div className="space-y-2">
                  {domain.answers
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
                                    ? domainInfo.color === 'purple' && 'bg-purple-400'
                                    : 'bg-slate-200',
                                  val <= answer.value
                                    ? domainInfo.color === 'blue' && 'bg-blue-400'
                                    : '',
                                  val <= answer.value
                                    ? domainInfo.color === 'emerald' && 'bg-emerald-400'
                                    : ''
                                )}
                              />
                            ))}
                          </div>
                          <span className={cn(
                            'text-sm font-semibold min-w-[2rem] text-right',
                            domainInfo.color === 'purple' && 'text-purple-600',
                            domainInfo.color === 'blue' && 'text-blue-600',
                            domainInfo.color === 'emerald' && 'text-emerald-600'
                          )}>
                            {answer.value}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )
          })}
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

export default function FIQRHistoryPage() {
  const [reports, setReports] = useState<FIQRReport[]>([])
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
        const response = await fetch('/api/reports/fiqr/history')
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
      const response = await fetch(`/api/reports/fiqr/${reportId}`)
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
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center animate-pulse shadow-lg shadow-purple-200">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <p className="text-purple-500 animate-pulse">Carregando historico...</p>
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
              <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
              <p className="text-slate-600">Carregando detalhes...</p>
            </div>
          </div>
        ) : reportDetails && (
          <ReportDetailsModal report={reportDetails} onClose={handleCloseDetails} />
        )
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-30">
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
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">FIQR</h1>
                <p className="text-xs text-purple-500">Questionario de Impacto da Fibromialgia</p>
              </div>
            </div>

            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
              <HeartPulse className="h-5 w-5 text-white" />
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
                        {insights.lastScore}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Ultimo Score</p>
                      <p className="text-xl font-bold text-slate-800">{insights.lastScore}/100</p>
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
                          {insights.variation.difference > 0 ? '+' : ''}{insights.variation.difference} pontos
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-800">{insights.totalResponses}</p>
                <p className="text-sm text-slate-500">Questionarios respondidos</p>
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
                    <p className="text-sm text-green-600">Pronto para responder</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-slate-800">{insights.daysUntilNext} dias</p>
                    <p className="text-sm text-slate-500">Proximo em {formatDate(insights.nextFIQRDate)}</p>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="mb-6 p-8 rounded-xl bg-purple-50 border border-purple-200 text-center">
            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Nenhum FIQR respondido</h3>
            <p className="text-purple-600 mb-4">
              Responda seu primeiro questionario para comecar a acompanhar sua evolucao.
            </p>
          </div>
        )}

        {/* Action Button */}
        <Link
          href={canSubmitNew ? '/patient/questionnaire/fiqr/new' : '#'}
          className={cn(
            'flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold text-lg transition-all mb-6',
            canSubmitNew
              ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-200'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          )}
          onClick={(e) => !canSubmitNew && e.preventDefault()}
        >
          <Plus className="h-5 w-5" />
          {hasReports ? 'Responder Novo FIQR' : 'Responder Primeiro FIQR'}
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
