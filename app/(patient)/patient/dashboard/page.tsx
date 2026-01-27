'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  HeartPulse,
  TrendingUp,
  FileText,
  LogOut,
  Bell,
  User,
  ChevronRight,
  Activity,
  Moon,
  Smile,
  Flame,
  Settings,
  Key,
  X,
  ClipboardList,
  Stethoscope,
  AlertTriangle,
  ChevronDown,
  GitBranch,
  Mail,
  Shield,
  HelpCircle,
  Check,
  Clock,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SimpleAnimatedBackground } from '@/components/shared/SimpleAnimatedBackground'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface SessionUser {
  id: string
  name: string | null
  email: string | null
  role: string
}

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'warning' | 'success'
}

// Mock data para o grafico
const mockChartData = [
  { day: 'Seg', dor: 6, fadiga: 5, sono: 7, humor: 6 },
  { day: 'Ter', dor: 7, fadiga: 6, sono: 5, humor: 5 },
  { day: 'Qua', dor: 5, fadiga: 4, sono: 6, humor: 7 },
  { day: 'Qui', dor: 6, fadiga: 5, sono: 7, humor: 6 },
  { day: 'Sex', dor: 4, fadiga: 3, sono: 8, humor: 8 },
  { day: 'Sab', dor: 5, fadiga: 4, sono: 7, humor: 7 },
  { day: 'Dom', dor: 3, fadiga: 3, sono: 8, humor: 8 },
]

const questionOptions = [
  { value: 'dor', label: 'Nivel de Dor', color: '#ef4444' },
  { value: 'fadiga', label: 'Fadiga', color: '#f97316' },
  { value: 'sono', label: 'Qualidade do Sono', color: '#6366f1' },
  { value: 'humor', label: 'Humor', color: '#22c55e' },
]

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Questionario pendente',
    message: 'Voce ainda nao respondeu o questionario de hoje.',
    time: 'Agora',
    read: false,
    type: 'warning'
  },
  {
    id: '2',
    title: 'Relatorio gerado',
    message: 'Seu relatorio semanal esta disponivel para visualizacao.',
    time: '2 horas atras',
    read: false,
    type: 'success'
  },
  {
    id: '3',
    title: 'Streak de 7 dias!',
    message: 'Parabens! Voce completou 7 dias consecutivos respondendo os questionarios.',
    time: 'Ontem',
    read: true,
    type: 'info'
  },
]

export default function PatientDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState('dor')
  const [questionSelectOpen, setQuestionSelectOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  useEffect(() => {
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('session='))

    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(decodeURIComponent(sessionCookie.split('=')[1]))
        setUser(sessionData)
      } catch {
        router.push('/login')
      }
    }
    setIsLoading(false)
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const selectedQuestionData = questionOptions.find(q => q.value === selectedQuestion)
  const todayScore = mockChartData[mockChartData.length - 1][selectedQuestion as keyof typeof mockChartData[0]]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-pulse shadow-lg shadow-blue-200">
            <HeartPulse className="h-7 w-7 text-white" />
          </div>
          <p className="text-blue-500 animate-pulse">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleAnimatedBackground />

      {/* Overlay para sidebar */}
      {(sidebarOpen || notificationsOpen) && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => {
            setSidebarOpen(false)
            setNotificationsOpen(false)
          }}
        />
      )}

      {/* Notifications Drawer */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-xl border-l border-blue-100 shadow-xl z-50 transform transition-transform duration-300 ease-out',
          notificationsOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header do Drawer */}
          <div className="p-5 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Notificacoes</h2>
                  <p className="text-xs text-slate-500">{unreadCount} nao lidas</p>
                </div>
              </div>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400">Nenhuma notificacao</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 rounded-xl border transition-all',
                    notification.read
                      ? 'bg-slate-50 border-slate-100'
                      : 'bg-blue-50/50 border-blue-100'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      notification.type === 'warning' && 'bg-amber-100',
                      notification.type === 'success' && 'bg-green-100',
                      notification.type === 'info' && 'bg-blue-100'
                    )}>
                      {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                      {notification.type === 'success' && <Check className="h-4 w-4 text-green-600" />}
                      {notification.type === 'info' && <Bell className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          'text-sm font-medium',
                          notification.read ? 'text-slate-600' : 'text-slate-800'
                        )}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {notification.time}
                        </span>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Marcar como lida"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-blue-100">
            <Link
              href="/patient/notifications"
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
            >
              Ver todas as notificacoes
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Profile Sidebar */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-xl border-l border-blue-100 shadow-xl z-50 transform transition-transform duration-300 ease-out',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header do Sidebar */}
          <div className="p-5 border-b border-blue-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">Minha Conta</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Dados do Paciente */}
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <User className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-slate-800 font-semibold truncate">{user?.name || 'Paciente'}</h3>
                <p className="text-slate-500 text-sm truncate">{user?.email}</p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                  <Shield className="h-3 w-3" />
                  Paciente
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="text-xs text-slate-400 uppercase tracking-wider px-3 mb-2">Menu</p>

            <Link
              href="/patient/profile"
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all group"
            >
              <div className="h-9 w-9 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <span>Meu Perfil</span>
              <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
            </Link>

            <Link
              href="/patient/settings"
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all group"
            >
              <div className="h-9 w-9 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <Settings className="h-4 w-4 text-blue-600" />
              </div>
              <span>Configuracoes</span>
              <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
            </Link>

            <Link
              href="/patient/change-password"
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all group"
            >
              <div className="h-9 w-9 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <Key className="h-4 w-4 text-blue-600" />
              </div>
              <span>Alterar Senha</span>
              <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
            </Link>

            <Link
              href="/patient/notifications"
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all group"
            >
              <div className="h-9 w-9 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
              <span>Notificacoes</span>
              <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
            </Link>

            <div className="pt-4 mt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wider px-3 mb-2">Suporte</p>

              <Link
                href="/patient/help"
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all group"
              >
                <div className="h-9 w-9 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                </div>
                <span>Ajuda</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
              </Link>

              <Link
                href="/patient/contact"
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all group"
              >
                <div className="h-9 w-9 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <span>Contato</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
              </Link>
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all group"
            >
              <div className="h-9 w-9 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                <LogOut className="h-4 w-4" />
              </div>
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-blue-100 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">Algia</h1>
                <p className="text-xs text-blue-500">Sistema de Monitoramento</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications Button */}
              <button
                onClick={() => setNotificationsOpen(true)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="relative h-8 w-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <Bell className="h-4 w-4 text-blue-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-slate-700">Notificacoes</p>
                  <p className="text-xs text-slate-400">{unreadCount} novas</p>
                </div>
              </button>

              {/* Profile Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-slate-700">{user?.name?.split(' ')[0] || 'Paciente'}</p>
                  <p className="text-xs text-slate-400">Ver perfil</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors hidden sm:block" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            Ola, {user?.name?.split(' ')[0] || 'Paciente'}!
          </h2>
          <p className="text-slate-500">Como voce esta se sentindo hoje?</p>
        </div>

        {/* Alert - Questionario pendente */}
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-amber-800 font-semibold">Questionario de hoje pendente!</h3>
            <p className="text-amber-600 text-sm">Responda o questionario diario para manter seu streak e acompanhar sua evolucao.</p>
          </div>
          <Link
            href="/patient/questionnaire/daily"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors flex-shrink-0 shadow-sm"
          >
            Responder agora
          </Link>
        </div>

        {/* Questionnaire Buttons */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Questionarios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* FIQR */}
            <Link
              href="/patient/questionnaire/fiqr"
              className="group rounded-xl bg-purple-50 border border-purple-200 p-5 transition-all hover:bg-purple-100 hover:border-purple-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-11 w-11 rounded-xl bg-purple-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <h4 className="text-purple-800 font-semibold mb-1">FIQR</h4>
              <p className="text-purple-600/70 text-sm">Questionario de Impacto da Fibromialgia</p>
              <div className="flex items-center gap-1 mt-3 text-purple-600 text-sm font-medium">
                <span>Acessar</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Diario */}
            <Link
              href="/patient/questionnaire/daily"
              className="group rounded-xl bg-blue-50 border border-blue-200 p-5 transition-all hover:bg-blue-100 hover:border-blue-300 hover:shadow-md relative"
            >
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold">Pendente</span>
              </div>
              <div className="flex items-start justify-between mb-4">
                <div className="h-11 w-11 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <h4 className="text-blue-800 font-semibold mb-1">Diario</h4>
              <p className="text-blue-600/70 text-sm">Acompanhamento diario de sintomas</p>
              <div className="flex items-center gap-1 mt-3 text-blue-600 text-sm font-medium">
                <span>Responder</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Consulta */}
            <Link
              href="/patient/questionnaire/consultation"
              className="group rounded-xl bg-emerald-50 border border-emerald-200 p-5 transition-all hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-11 w-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <h4 className="text-emerald-800 font-semibold mb-1">Consulta</h4>
              <p className="text-emerald-600/70 text-sm">Pre-consulta medica</p>
              <div className="flex items-center gap-1 mt-3 text-emerald-600 text-sm font-medium">
                <span>Acessar</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Chart and Score Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Chart */}
          <div className="lg:col-span-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-slate-800 font-semibold">Evolucao dos Ultimos 7 Dias</h3>
                <p className="text-slate-400 text-sm">Acompanhe sua evolucao ao longo da semana</p>
              </div>

              {/* Question Select */}
              <div className="relative">
                <button
                  onClick={() => setQuestionSelectOpen(!questionSelectOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:border-blue-300 transition-colors text-sm"
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: selectedQuestionData?.color }}
                  />
                  <span className="text-slate-700">{selectedQuestionData?.label}</span>
                  <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', questionSelectOpen && 'rotate-180')} />
                </button>

                {questionSelectOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-lg z-10 overflow-hidden">
                    {questionOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedQuestion(option.value)
                          setQuestionSelectOpen(false)
                        }}
                        className={cn(
                          'flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-slate-50 transition-colors',
                          selectedQuestion === option.value ? 'text-blue-600 bg-blue-50' : 'text-slate-600'
                        )}
                      >
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={selectedQuestion}
                    stroke={selectedQuestionData?.color}
                    strokeWidth={3}
                    dot={{ fill: selectedQuestionData?.color, strokeWidth: 0, r: 5 }}
                    activeDot={{ r: 7, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today Score Card */}
          <div className="rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 p-5 flex flex-col shadow-sm">
            <h3 className="text-slate-800 font-semibold mb-1">Score de Hoje</h3>
            <p className="text-slate-400 text-sm mb-6">{selectedQuestionData?.label}</p>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative">
                <div
                  className="h-32 w-32 rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(${selectedQuestionData?.color} ${(todayScore as number) * 10}%, #e2e8f0 0)`
                  }}
                >
                  <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-inner">
                    <span className="text-4xl font-bold text-slate-800">{todayScore}</span>
                  </div>
                </div>
                <div
                  className="absolute -top-1 -right-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white shadow-sm"
                  style={{ backgroundColor: selectedQuestionData?.color }}
                >
                  /10
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>+0.5 vs ontem</span>
                </div>
              </div>
            </div>

            <Link
              href="/patient/questionnaire/daily"
              className="mt-4 w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-center transition-colors shadow-sm"
            >
              Atualizar Score
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 p-4 hover:border-orange-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-800">7</p>
            <p className="text-slate-400 text-sm">Dias de Streak</p>
          </div>

          <div className="rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 p-4 hover:border-green-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-xs text-green-500 font-medium">+0.5</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">7.2</p>
            <p className="text-slate-400 text-sm">Score Semanal</p>
          </div>

          <div className="rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Moon className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">6.8</p>
            <p className="text-slate-400 text-sm">Qualidade Sono</p>
          </div>

          <div className="rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 p-4 hover:border-yellow-300 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Smile className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800">Bom</p>
            <p className="text-slate-400 text-sm">Humor Geral</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-800 font-semibold">Atividade Recente</h3>
              <p className="text-slate-400 text-sm">Suas ultimas interacoes</p>
            </div>
            <Link href="/patient/history" className="text-blue-500 text-sm hover:text-blue-600 transition-colors">
              Ver tudo
            </Link>
          </div>

          <div className="space-y-2">
            {[
              { action: 'Questionario diario respondido', time: 'Ontem as 21:30', icon: Activity, color: 'blue' },
              { action: 'Relatorio semanal gerado', time: '3 dias atras', icon: FileText, color: 'purple' },
              { action: 'FIQR completado', time: '5 dias atras', icon: ClipboardList, color: 'emerald' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className={cn(
                  'h-10 w-10 rounded-xl flex items-center justify-center',
                  item.color === 'blue' && 'bg-blue-100',
                  item.color === 'purple' && 'bg-purple-100',
                  item.color === 'emerald' && 'bg-emerald-100'
                )}>
                  <item.icon className={cn(
                    'h-5 w-5',
                    item.color === 'blue' && 'text-blue-500',
                    item.color === 'purple' && 'text-purple-500',
                    item.color === 'emerald' && 'text-emerald-500'
                  )} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{item.action}</p>
                  <p className="text-xs text-slate-400">{item.time}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <HeartPulse className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-slate-700 font-semibold text-sm">Algia</p>
                <p className="text-slate-400 text-xs">Sistema de Monitoramento de Dor Cronica</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/terms" className="hover:text-blue-500 transition-colors">Termos</Link>
              <Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacidade</Link>
              <Link href="/help" className="hover:text-blue-500 transition-colors">Ajuda</Link>
            </div>

            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <GitBranch className="h-4 w-4" />
              <span>v0.0.1</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
