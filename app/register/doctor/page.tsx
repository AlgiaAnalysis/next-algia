'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  HeartPulse,
  GitBranch,
  AlertCircle,
  User,
  CreditCard,
  Stethoscope,
  CheckCircle2,
  Home
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AnimatedBackground } from '@/components/shared/AnimatedBackground'
import { cn } from '@/lib/utils'

interface FormData {
  // Dados pessoais
  name: string
  email: string
  cpf: string
  // Credenciais
  password: string
  confirmPassword: string
  // Dados profissionais
  crm: string
}

interface FormErrors {
  name?: string
  email?: string
  cpf?: string
  password?: string
  confirmPassword?: string
  crm?: string
}

type FormSection = 'personal' | 'credentials' | 'professional'

export default function DoctorRegisterPage() {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState<FormSection>('personal')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    cpf: '',
    password: '',
    confirmPassword: '',
    crm: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const formatCPF = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  const formatCRM = (value: string): string => {
    // CRM format: CRM/UF 123456 or just numbers
    return value.toUpperCase().replace(/[^A-Z0-9/\-]/g, '')
  }

  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '')
    if (numbers.length !== 11) return false
    if (/^(\d)\1+$/.test(numbers)) return false

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers.charAt(i)) * (10 - i)
    }
    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers.charAt(9))) return false

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers.charAt(i)) * (11 - i)
    }
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== parseInt(numbers.charAt(10))) return false

    return true
  }

  const validateSection = (section: FormSection): boolean => {
    const newErrors: FormErrors = {}

    if (section === 'personal') {
      if (!formData.name.trim()) {
        newErrors.name = 'Nome e obrigatorio'
      } else if (formData.name.trim().length < 3) {
        newErrors.name = 'Nome deve ter pelo menos 3 caracteres'
      }

      if (!formData.email) {
        newErrors.email = 'Email e obrigatorio'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email invalido'
      }

      if (!formData.cpf) {
        newErrors.cpf = 'CPF e obrigatorio'
      } else if (!validateCPF(formData.cpf)) {
        newErrors.cpf = 'CPF invalido'
      }
    }

    if (section === 'credentials') {
      if (!formData.password) {
        newErrors.password = 'Senha e obrigatoria'
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirme sua senha'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas nao coincidem'
      }
    }

    if (section === 'professional') {
      if (!formData.crm.trim()) {
        newErrors.crm = 'CRM e obrigatorio'
      } else if (formData.crm.trim().length < 4) {
        newErrors.crm = 'CRM invalido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentSection === 'personal' && validateSection('personal')) {
      setCurrentSection('credentials')
    } else if (currentSection === 'credentials' && validateSection('credentials')) {
      setCurrentSection('professional')
    }
  }

  const handleBack = () => {
    if (currentSection === 'credentials') {
      setCurrentSection('personal')
    } else if (currentSection === 'professional') {
      setCurrentSection('credentials')
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    if (field === 'cpf') {
      value = formatCPF(value)
    } else if (field === 'crm') {
      value = formatCRM(value)
    }
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
    setServerError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!validateSection('professional')) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/doctors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf.replace(/\D/g, ''),
          password: formData.password,
          crm: formData.crm
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setServerError(data.error || 'Erro ao criar conta')
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch {
      setServerError('Erro de conexao. Tente novamente.')
      setIsLoading(false)
    }
  }

  const sections: { id: FormSection; label: string; icon: React.ReactNode }[] = [
    { id: 'personal', label: 'Dados Pessoais', icon: <User className="h-4 w-4" /> },
    { id: 'credentials', label: 'Credenciais', icon: <Lock className="h-4 w-4" /> },
    { id: 'professional', label: 'Dados Profissionais', icon: <Stethoscope className="h-4 w-4" /> }
  ]

  const currentIndex = sections.findIndex(s => s.id === currentSection)

  if (success) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <AnimatedBackground />
        <Card className="w-full max-w-md shadow-xl border border-blue-100 bg-white/90 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-blue-900 mb-2">Conta criada com sucesso!</h2>
            <p className="text-blue-600/70">Redirecionando para o login...</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 py-8 relative">
      <AnimatedBackground />

      {/* Botoes de navegacao */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Link
          href="/"
          className="h-9 px-3 rounded-lg bg-white/90 backdrop-blur-sm border border-blue-100 flex items-center gap-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-md text-sm font-medium"
          title="Pagina inicial"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Inicio</span>
        </Link>
        <Link
          href="/register/patient"
          className="h-9 px-3 rounded-lg bg-white/90 backdrop-blur-sm border border-blue-100 flex items-center gap-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-md text-sm font-medium"
          title="Cadastro de paciente"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Paciente</span>
        </Link>
        <Link
          href="/login"
          className="h-9 px-3 rounded-lg bg-white/90 backdrop-blur-sm border border-blue-100 flex items-center gap-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-md text-sm font-medium"
          title="Login"
        >
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline">Entrar</span>
        </Link>
      </div>

      <Card className="w-full max-w-lg shadow-xl border border-blue-100 bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Stethoscope className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-900">Cadastro de Medico</CardTitle>
          <CardDescription className="text-blue-600/70">
            Preencha seus dados para se cadastrar como profissional
          </CardDescription>
        </CardHeader>

        {/* Progress Steps */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            {sections.map((section, index) => (
              <div key={section.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center transition-all',
                      index < currentIndex
                        ? 'bg-green-500 text-white'
                        : index === currentIndex
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-100 text-blue-400'
                    )}
                  >
                    {index < currentIndex ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      section.icon
                    )}
                  </div>
                  <span className={cn(
                    'text-xs mt-1 hidden sm:block',
                    index <= currentIndex ? 'text-blue-600' : 'text-blue-300'
                  )}>
                    {section.label}
                  </span>
                </div>
                {index < sections.length - 1 && (
                  <div
                    className={cn(
                      'h-1 w-12 sm:w-20 mx-2',
                      index < currentIndex ? 'bg-green-500' : 'bg-blue-100'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Erro do servidor */}
            {serverError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{serverError}</p>
              </div>
            )}

            {/* Secao: Dados Pessoais */}
            {currentSection === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dados Pessoais
                </h3>

                {/* Nome */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-blue-900">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Dr(a). Nome Completo"
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      className={cn(
                        'pl-10 border-blue-200 focus:border-blue-400 focus-visible:ring-blue-400',
                        errors.name && 'border-destructive focus-visible:ring-destructive'
                      )}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                {/* Email */}
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
                      value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                      className={cn(
                        'pl-10 border-blue-200 focus:border-blue-400 focus-visible:ring-blue-400',
                        errors.email && 'border-destructive focus-visible:ring-destructive'
                      )}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                {/* CPF */}
                <div className="space-y-2 mb-6">
                  <label htmlFor="cpf" className="text-sm font-medium text-blue-900">
                    CPF
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={e => handleChange('cpf', e.target.value)}
                      maxLength={14}
                      className={cn(
                        'pl-10 border-blue-200 focus:border-blue-400 focus-visible:ring-blue-400',
                        errors.cpf && 'border-destructive focus-visible:ring-destructive'
                      )}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
                </div>
              </div>
            )}

            {/* Secao: Credenciais */}
            {currentSection === 'credentials' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Credenciais de Acesso
                </h3>

                {/* Senha */}
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
                      value={formData.password}
                      onChange={e => handleChange('password', e.target.value)}
                      className={cn(
                        'pl-10 pr-10 border-blue-200 focus:border-blue-400 focus-visible:ring-blue-400',
                        errors.password && 'border-destructive focus-visible:ring-destructive'
                      )}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-2 mb-6">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-blue-900">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="********"
                      value={formData.confirmPassword}
                      onChange={e => handleChange('confirmPassword', e.target.value)}
                      className={cn(
                        'pl-10 pr-10 border-blue-200 focus:border-blue-400 focus-visible:ring-blue-400',
                        errors.confirmPassword && 'border-destructive focus-visible:ring-destructive'
                      )}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>
            )}

            {/* Secao: Dados Profissionais */}
            {currentSection === 'professional' && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Dados Profissionais
                </h3>

                {/* CRM */}
                <div className="space-y-2 mb-6">
                  <label htmlFor="crm" className="text-sm font-medium text-blue-900">
                    CRM
                  </label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <Input
                      id="crm"
                      type="text"
                      placeholder="CRM/UF 123456"
                      value={formData.crm}
                      onChange={e => handleChange('crm', e.target.value)}
                      className={cn(
                        'pl-10 border-blue-200 focus:border-blue-400 focus-visible:ring-blue-400',
                        errors.crm && 'border-destructive focus-visible:ring-destructive'
                      )}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.crm && <p className="text-sm text-destructive">{errors.crm}</p>}
                  <p className="text-xs text-blue-400">
                    Informe seu registro no Conselho Regional de Medicina
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <div className="flex gap-2 w-full">
              {currentSection !== 'personal' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                  disabled={isLoading}
                >
                  Voltar
                </Button>
              )}

              {currentSection !== 'professional' ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className={cn(
                    'flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-200',
                    currentSection === 'personal' && 'w-full'
                  )}
                  disabled={isLoading}
                >
                  Proximo
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md shadow-green-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </Button>
              )}
            </div>

            <p className="text-sm text-center text-blue-600/70">
              Ja tem uma conta?{' '}
              <Link
                href="/login"
                className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
              >
                Entrar
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
