'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trophy,
  TrendingUp,
  Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SimpleAnimatedBackground } from '@/components/shared/SimpleAnimatedBackground'

interface DailyQuestion {
  id: string
  name: string
  index: number
}

interface DailyScoreResult {
  score: number
  totalAnswers: number
  rawSum: number
}

// Tipo para as respostas: mapeamento de questionId para valor (0-10) ou null
export type DailyAnswers = Record<string, number | null>

function ScoreButton({
  value,
  selected,
  onClick
}: {
  value: number
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 font-semibold text-sm transition-all duration-200',
        selected
          ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-200 scale-110'
          : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50'
      )}
    >
      {value}
    </button>
  )
}

function QuestionCard({
  question,
  answer,
  onAnswer,
  questionNumber
}: {
  question: DailyQuestion
  answer: number | null
  onAnswer: (value: number | null) => void
  questionNumber: number
}) {
  const handleClick = (value: number) => {
    if (answer === value) {
      onAnswer(null)
    } else {
      onAnswer(value)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold bg-blue-100 text-blue-600">
          {questionNumber}
        </span>
        <p className="text-slate-700 font-medium leading-relaxed">{question.name}</p>
      </div>

      <div className="flex items-center justify-between gap-1 sm:gap-2">
        <span className="text-xs text-slate-400 hidden sm:block min-w-[80px]">Sem sintomas</span>
        <div className="flex items-center gap-1 sm:gap-1.5 flex-1 sm:flex-none justify-center">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <ScoreButton
              key={value}
              value={value}
              selected={answer === value}
              onClick={() => handleClick(value)}
            />
          ))}
        </div>
        <span className="text-xs text-slate-400 hidden sm:block min-w-[80px] text-right">Muito intenso</span>
      </div>

      <div className="flex justify-between mt-2 sm:hidden">
        <span className="text-xs text-slate-400">0 = Sem sintomas</span>
        <span className="text-xs text-slate-400">10 = Muito intenso</span>
      </div>
    </div>
  )
}

function SuccessModal({
  score,
  onClose
}: {
  score: DailyScoreResult
  onClose: () => void
}) {
  const getScoreLevel = (score: number) => {
    if (score <= 3) return { label: 'Leve', color: 'text-green-600', bg: 'bg-green-100' }
    if (score <= 5) return { label: 'Moderado', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    if (score <= 7) return { label: 'Elevado', color: 'text-orange-600', bg: 'bg-orange-100' }
    return { label: 'Intenso', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const level = getScoreLevel(score.score)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Diario Concluido!</h2>
          <p className="text-slate-500">Seu questionario diario foi salvo com sucesso</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-1">Score do Dia</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-bold text-slate-800">{score.score.toFixed(1)}</span>
              <span className="text-xl text-slate-400">/10</span>
            </div>
            <span className={cn('inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium', level.bg, level.color)}>
              {level.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg mb-6">
          <Flame className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <p className="text-sm text-orange-700">
            Continue respondendo diariamente para manter seu streak!
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-6">
          <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Acompanhe sua evolucao ao longo do tempo no historico.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
        >
          Ver Historico
        </button>
      </div>
    </div>
  )
}

export default function DailyQuestionnaireNew() {
  const router = useRouter()
  const [questions, setQuestions] = useState<DailyQuestion[] | null>(null)
  const [answers, setAnswers] = useState<DailyAnswers>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [score, setScore] = useState<DailyScoreResult | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('/api/questions/daily')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao carregar perguntas')
        }

        setQuestions(data.questions)

        const initialAnswers: DailyAnswers = {}
        data.questions.forEach((q: DailyQuestion) => {
          initialAnswers[q.id] = null
        })
        setAnswers(initialAnswers)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar perguntas')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const handleAnswer = (questionId: string, value: number | null) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
    if (submitError) {
      setSubmitError(null)
    }
  }

  const totalQuestions = questions?.length || 0
  const answeredQuestions = Object.values(answers).filter(v => v !== null).length
  const isComplete = totalQuestions > 0 && answeredQuestions === totalQuestions

  const validateAnswers = (): { valid: boolean; error?: string } => {
    if (!questions) {
      return { valid: false, error: 'Perguntas nao carregadas' }
    }

    const unanswered = questions.filter(
      q => answers[q.id] === null || answers[q.id] === undefined
    )

    if (unanswered.length > 0) {
      return {
        valid: false,
        error: `Por favor, responda todas as ${unanswered.length} perguntas restantes`
      }
    }

    for (const [, value] of Object.entries(answers)) {
      if (value !== null && (value < 0 || value > 10)) {
        return {
          valid: false,
          error: 'Valores devem estar entre 0 e 10'
        }
      }
    }

    return { valid: true }
  }

  const handleSubmit = async () => {
    const validation = validateAnswers()
    if (!validation.valid) {
      setSubmitError(validation.error || 'Erro de validacao')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/reports/daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar questionario')
      }

      setScore(data.score)
      setShowSuccess(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar questionario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSuccess = () => {
    router.push('/patient/questionnaire/daily')
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
            <p className="text-blue-500 animate-pulse">Carregando questionario...</p>
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

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <SimpleAnimatedBackground />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200 p-6 max-w-md w-full text-center">
            <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Sem perguntas disponiveis</h2>
            <p className="text-slate-500 mb-4">Nao ha perguntas cadastradas para o questionario diario.</p>
            <Link
              href="/patient/dashboard"
              className="inline-block px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleAnimatedBackground />

      {showSuccess && score && (
        <SuccessModal score={score} onClose={handleCloseSuccess} />
      )}

      <header className="bg-white/80 backdrop-blur-xl border-b border-blue-100 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/patient/questionnaire/daily"
                className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">Diario de Hoje</h1>
                <p className="text-xs text-blue-500">Acompanhamento diario de sintomas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-700">{answeredQuestions} de {totalQuestions}</p>
                <p className="text-xs text-slate-400">perguntas respondidas</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
                <Activity className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
            style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 pb-32">
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800">Como voce esta hoje?</h3>
              <p className="text-blue-600 text-sm mt-1">
                Para cada pergunta, clique no numero que melhor representa como voce se sente hoje.
                A escala vai de 0 (sem sintomas) ate 10 (muito intenso).
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {questions.map((question, idx) => (
            <QuestionCard
              key={question.id}
              question={question}
              answer={answers[question.id] ?? null}
              onAnswer={(value) => handleAnswer(question.id, value)}
              questionNumber={idx + 1}
            />
          ))}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-4 z-30">
        <div className="container mx-auto">
          {submitError && (
            <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isComplete ? (
                <>
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-700">Questionario completo!</p>
                    <p className="text-sm text-green-600">Todas as perguntas foram respondidas</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">Em andamento</p>
                    <p className="text-sm text-slate-500">Faltam {totalQuestions - answeredQuestions} perguntas</p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isComplete || isSubmitting}
              className={cn(
                'px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2',
                isComplete
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Finalizar'
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
