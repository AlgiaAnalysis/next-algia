'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  HeartPulse,
  ArrowLeft,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trophy,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SimpleAnimatedBackground } from '@/components/shared/SimpleAnimatedBackground'

interface Question {
  id: string
  name: string
  domain: 'first_domain' | 'second_domain' | 'third_domain'
  index: number
}

interface QuestionsByDomain {
  first_domain: Question[]
  second_domain: Question[]
  third_domain: Question[]
}

interface DomainScore {
  domain: string
  rawScore: number
  normalizedScore: number
  answersCount: number
}

interface FIQRScoreResult {
  totalScore: number
  domainScores: {
    first_domain: DomainScore
    second_domain: DomainScore
    third_domain: DomainScore
  }
}

// Tipo para as respostas: mapeamento de questionId para valor (0-10) ou null
export type FIQRAnswers = Record<string, number | null>

const domainInfo = {
  first_domain: {
    title: 'Funcao',
    description: 'Avalie o quanto a fibromialgia dificultou suas atividades nos ultimos 7 dias',
    color: 'purple',
    minLabel: 'Sem dificuldade',
    maxLabel: 'Muita dificuldade'
  },
  second_domain: {
    title: 'Impacto Global',
    description: 'Avalie o impacto geral da fibromialgia na sua vida',
    color: 'blue',
    minLabel: 'Nenhum impacto',
    maxLabel: 'Muito impacto'
  },
  third_domain: {
    title: 'Sintomas',
    description: 'Avalie a intensidade dos seus sintomas nos ultimos 7 dias',
    color: 'emerald',
    minLabel: 'Sem sintomas',
    maxLabel: 'Sintomas intensos'
  }
}

function ScoreButton({
  value,
  selected,
  onClick,
  color
}: {
  value: number
  selected: boolean
  onClick: () => void
  color: string
}) {
  const colorStyles = {
    purple: {
      selected: 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-200 scale-110',
      hover: 'hover:border-purple-300 hover:bg-purple-50'
    },
    blue: {
      selected: 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-200 scale-110',
      hover: 'hover:border-blue-300 hover:bg-blue-50'
    },
    emerald: {
      selected: 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200 scale-110',
      hover: 'hover:border-emerald-300 hover:bg-emerald-50'
    }
  }

  const styles = colorStyles[color as keyof typeof colorStyles]

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 font-semibold text-sm transition-all duration-200',
        selected
          ? styles.selected
          : `border-slate-200 text-slate-600 ${styles.hover}`
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
  color,
  questionNumber,
  minLabel,
  maxLabel
}: {
  question: Question
  answer: number | null
  onAnswer: (value: number | null) => void
  color: string
  questionNumber: number
  minLabel: string
  maxLabel: string
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
        <span className={cn(
          'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold',
          color === 'purple' && 'bg-purple-100 text-purple-600',
          color === 'blue' && 'bg-blue-100 text-blue-600',
          color === 'emerald' && 'bg-emerald-100 text-emerald-600'
        )}>
          {questionNumber}
        </span>
        <p className="text-slate-700 font-medium leading-relaxed">{question.name}</p>
      </div>

      <div className="flex items-center justify-between gap-1 sm:gap-2">
        <span className="text-xs text-slate-400 hidden sm:block min-w-[80px]">{minLabel}</span>
        <div className="flex items-center gap-1 sm:gap-1.5 flex-1 sm:flex-none justify-center">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <ScoreButton
              key={value}
              value={value}
              selected={answer === value}
              onClick={() => handleClick(value)}
              color={color}
            />
          ))}
        </div>
        <span className="text-xs text-slate-400 hidden sm:block min-w-[80px] text-right">{maxLabel}</span>
      </div>

      <div className="flex justify-between mt-2 sm:hidden">
        <span className="text-xs text-slate-400">0 = {minLabel}</span>
        <span className="text-xs text-slate-400">10 = {maxLabel}</span>
      </div>
    </div>
  )
}

function DomainSection({
  domain,
  questions,
  answers,
  onAnswer,
  startNumber
}: {
  domain: 'first_domain' | 'second_domain' | 'third_domain'
  questions: Question[]
  answers: FIQRAnswers
  onAnswer: (questionId: string, value: number | null) => void
  startNumber: number
}) {
  const info = domainInfo[domain]
  const answeredCount = questions.filter(q => answers[q.id] !== null && answers[q.id] !== undefined).length

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-10 w-10 rounded-xl flex items-center justify-center',
            info.color === 'purple' && 'bg-purple-100',
            info.color === 'blue' && 'bg-blue-100',
            info.color === 'emerald' && 'bg-emerald-100'
          )}>
            <FileText className={cn(
              'h-5 w-5',
              info.color === 'purple' && 'text-purple-600',
              info.color === 'blue' && 'text-blue-600',
              info.color === 'emerald' && 'text-emerald-600'
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{info.title}</h3>
            <p className="text-sm text-slate-500">{info.description}</p>
          </div>
        </div>
        <div className={cn(
          'px-3 py-1.5 rounded-lg text-sm font-medium',
          answeredCount === questions.length
            ? 'bg-green-100 text-green-700'
            : 'bg-slate-100 text-slate-600'
        )}>
          {answeredCount}/{questions.length}
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((question, idx) => (
          <QuestionCard
            key={question.id}
            question={question}
            answer={answers[question.id] ?? null}
            onAnswer={(value) => onAnswer(question.id, value)}
            color={info.color}
            questionNumber={startNumber + idx}
            minLabel={info.minLabel}
            maxLabel={info.maxLabel}
          />
        ))}
      </div>
    </div>
  )
}

function SuccessModal({
  scores,
  onClose
}: {
  scores: FIQRScoreResult
  onClose: () => void
}) {
  const getScoreLevel = (score: number) => {
    if (score <= 25) return { label: 'Leve', color: 'text-green-600', bg: 'bg-green-100' }
    if (score <= 50) return { label: 'Moderado', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    if (score <= 75) return { label: 'Severo', color: 'text-orange-600', bg: 'bg-orange-100' }
    return { label: 'Muito Severo', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const level = getScoreLevel(scores.totalScore)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Questionario Concluido!</h2>
          <p className="text-slate-500">Seu FIQR foi salvo com sucesso</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <div className="text-center mb-4">
            <p className="text-sm text-slate-500 mb-1">Score Total</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-bold text-slate-800">{scores.totalScore}</span>
              <span className="text-xl text-slate-400">/100</span>
            </div>
            <span className={cn('inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium', level.bg, level.color)}>
              {level.label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 mb-1">Funcao</p>
              <p className="text-lg font-semibold text-purple-700">
                {scores.domainScores.first_domain.normalizedScore}
              </p>
              <p className="text-xs text-purple-400">/30</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Impacto</p>
              <p className="text-lg font-semibold text-blue-700">
                {scores.domainScores.second_domain.normalizedScore}
              </p>
              <p className="text-xs text-blue-400">/20</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <p className="text-xs text-emerald-600 mb-1">Sintomas</p>
              <p className="text-lg font-semibold text-emerald-700">
                {scores.domainScores.third_domain.normalizedScore}
              </p>
              <p className="text-xs text-emerald-400">/50</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-6">
          <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Continue respondendo para acompanhar sua evolucao ao longo do tempo.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl transition-colors"
        >
          Ver Historico
        </button>
      </div>
    </div>
  )
}

export default function FIQRQuestionnaireNew() {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuestionsByDomain | null>(null)
  const [answers, setAnswers] = useState<FIQRAnswers>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [scores, setScores] = useState<FIQRScoreResult | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch('/api/questions/fiqr')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao carregar perguntas')
        }

        setQuestions(data.questions)

        const initialAnswers: FIQRAnswers = {}
        Object.values(data.questions as QuestionsByDomain).flat().forEach((q: Question) => {
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

  const totalQuestions = questions
    ? questions.first_domain.length + questions.second_domain.length + questions.third_domain.length
    : 0

  const answeredQuestions = Object.values(answers).filter(v => v !== null).length
  const isComplete = totalQuestions > 0 && answeredQuestions === totalQuestions

  const validateAnswers = (): { valid: boolean; error?: string } => {
    if (!questions) {
      return { valid: false, error: 'Perguntas nao carregadas' }
    }

    const allQuestions = [
      ...questions.first_domain,
      ...questions.second_domain,
      ...questions.third_domain
    ]

    const unanswered = allQuestions.filter(
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
      const response = await fetch('/api/reports/fiqr', {
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

      setScores(data.scores)
      setShowSuccess(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar questionario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSuccess = () => {
    router.push('/patient/questionnaire/fiqr')
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
            <p className="text-purple-500 animate-pulse">Carregando questionario...</p>
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

  if (!questions) return null

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleAnimatedBackground />

      {showSuccess && scores && (
        <SuccessModal scores={scores} onClose={handleCloseSuccess} />
      )}

      <header className="bg-white/80 backdrop-blur-xl border-b border-purple-100 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/patient/questionnaire/fiqr"
                className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">Novo FIQR</h1>
                <p className="text-xs text-purple-500">Questionario de Impacto da Fibromialgia</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-700">{answeredQuestions} de {totalQuestions}</p>
                <p className="text-xs text-slate-400">perguntas respondidas</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-200">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
            style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 pb-32">
        <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-200">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-800">Instrucoes</h3>
              <p className="text-purple-600 text-sm mt-1">
                Para cada pergunta, clique no numero que melhor representa sua resposta.
                A escala vai de 0 ate 10. Clique novamente no mesmo numero para desmarcar.
              </p>
            </div>
          </div>
        </div>

        <DomainSection
          domain="first_domain"
          questions={questions.first_domain}
          answers={answers}
          onAnswer={handleAnswer}
          startNumber={1}
        />

        <DomainSection
          domain="second_domain"
          questions={questions.second_domain}
          answers={answers}
          onAnswer={handleAnswer}
          startNumber={questions.first_domain.length + 1}
        />

        <DomainSection
          domain="third_domain"
          questions={questions.third_domain}
          answers={answers}
          onAnswer={handleAnswer}
          startNumber={questions.first_domain.length + questions.second_domain.length + 1}
        />
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
                  ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-200'
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
