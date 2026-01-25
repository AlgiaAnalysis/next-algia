'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  HeartPulse,
  Calendar,
  TrendingUp,
  FileText,
  LogOut,
  Bell,
  User,
  ChevronRight,
  Activity,
  Moon,
  Smile,
  Flame
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SessionUser {
  id: string
  name: string | null
  email: string | null
  role: string
}

export default function PatientDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Busca os dados da sessao do cookie (client-side)
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('session='))

    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(decodeURIComponent(sessionCookie.split('=')[1]))
        setTimeout(() => {
          setUser(sessionData)
        }, 1000)
      } catch {
        router.push('/login')
      }
    }
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-blue-900">Algia</h1>
                <p className="text-xs text-blue-500">Area do Paciente</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-blue-400 hover:text-blue-600 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-blue-100">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-blue-900">{user?.name || 'Paciente'}</p>
                  <p className="text-xs text-blue-500">{user?.email}</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-900">
            Ola, {user?.name?.split(' ')[0] || 'Paciente'}!
          </h2>
          <p className="text-blue-600/70">Como voce esta se sentindo hoje?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-blue-100 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-100 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-500">Streak Atual</p>
                  <p className="text-3xl font-bold text-blue-900">7</p>
                  <p className="text-xs text-blue-400">dias consecutivos</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-100 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-500">Score Semanal</p>
                  <p className="text-3xl font-bold text-blue-900">7.2</p>
                  <p className="text-xs text-green-500">+0.5 vs semana anterior</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-100 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-500">Qualidade do Sono</p>
                  <p className="text-3xl font-bold text-blue-900">6.8</p>
                  <p className="text-xs text-blue-400">media dos ultimos 7 dias</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Moon className="h-6 w-6 text-indigo-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-100 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-500">Humor</p>
                  <p className="text-3xl font-bold text-blue-900">Bom</p>
                  <p className="text-xs text-blue-400">baseado nas respostas</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Smile className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Questionario Diario */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl hover:shadow-blue-200 transition-all cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Activity className="h-6 w-6" />
                </div>
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs">Pendente</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">Questionario Diario</h3>
              <p className="text-blue-100 text-sm mb-4">
                Responda suas perguntas diarias e mantenha seu streak!
              </p>
              <div className="flex items-center text-sm">
                <span>Responder agora</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>

          {/* Ver Relatorios */}
          <Card className="border-blue-100 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-100 transition-all cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">3 novos</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Meus Relatorios</h3>
              <p className="text-blue-500 text-sm mb-4">
                Veja seus relatorios semanais e mensais
              </p>
              <div className="flex items-center text-sm text-blue-600">
                <span>Ver relatorios</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>

          {/* Proxima Consulta */}
          <Card className="border-blue-100 bg-white/80 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-100 transition-all cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Proxima Consulta</h3>
              <p className="text-blue-500 text-sm mb-4">
                Nenhuma consulta agendada
              </p>
              <div className="flex items-center text-sm text-blue-600">
                <span>Ver agenda</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-blue-100 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-blue-900">Atividade Recente</CardTitle>
            <CardDescription className="text-blue-500">
              Suas ultimas interacoes no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Questionario diario respondido', time: 'Ontem as 21:30', icon: Activity },
                { action: 'Relatorio semanal gerado', time: '3 dias atras', icon: FileText },
                { action: 'Questionario diario respondido', time: '4 dias atras', icon: Activity },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">{item.action}</p>
                    <p className="text-xs text-blue-400">{item.time}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-blue-300" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-100 bg-white/50 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-blue-400 text-sm">
          Algia v0.0.1
        </div>
      </footer>
    </div>
  )
}
