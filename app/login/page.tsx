'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Loader2, HeartPulse, GitBranch, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AnimatedBackground } from '@/components/shared/AnimatedBackground'
import { cn } from '@/lib/utils'

interface FormErrors {
  email?: string
  password?: string
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })

  const validateEmail = (value: string): string | undefined => {
    if (!value) {
      return 'Email e obrigatorio'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Email invalido'
    }
    return undefined
  }

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return 'Senha e obrigatoria'
    }
    if (value.length < 6) {
      return 'Senha deve ter pelo menos 6 caracteres'
    }
    return undefined
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setServerError(null)
    if (touched.email) {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }))
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setServerError(null)
    if (touched.password) {
      setErrors(prev => ({ ...prev, password: validatePassword(value) }))
    }
  }

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }))
    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(email) }))
    } else {
      setErrors(prev => ({ ...prev, password: validatePassword(password) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    setErrors({ email: emailError, password: passwordError })
    setTouched({ email: true, password: true })

    if (emailError || passwordError) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setServerError(data.error || 'Erro ao fazer login')
        setIsLoading(false)
        return
      }

      // Redireciona para a area correta
      router.push(data.redirectTo || '/patient/dashboard')
    } catch {
      setServerError('Erro de conexao. Tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <AnimatedBackground />

      <Card className="w-full max-w-md shadow-xl border border-blue-100 bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <HeartPulse className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">Bem-vindo ao Algia</CardTitle>
          <CardDescription className="text-blue-600/70">
            Entre com suas credenciais para acessar sua conta
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Erro do servidor */}
            {serverError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{serverError}</p>
              </div>
            )}

            {/* Campo Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-blue-900">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={cn(
                    'pl-10 border-blue-200 focus:border-blue-400 focus-visible:ring-blue-400',
                    errors.email && touched.email && 'border-destructive focus-visible:ring-destructive'
                  )}
                  disabled={isLoading}
                />
              </div>
              {errors.email && touched.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-blue-900">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={e => handlePasswordChange(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={cn(
                    'pl-10 pr-10 border-blue-200 focus:border-blue-400 focus-visible:ring-blue-400',
                    errors.password && touched.password && 'border-destructive focus-visible:ring-destructive'
                  )}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Link Esqueceu a senha */}
            <div className="flex justify-end mb-4">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-500 hover:text-blue-700 hover:underline transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r hover:cursor-pointer from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            <p className="text-sm text-center text-blue-600/70">
              Nao tem uma conta?{' '}
              <Link
                href="/register"
                className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
              >
                Cadastre-se
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Footer com versao */}
      <footer className="mt-8 flex items-center gap-2 text-blue-400/60 text-sm">
        <GitBranch className="h-4 w-4" />
        <span>v0.0.1</span>
      </footer>
    </main>
  )
}
