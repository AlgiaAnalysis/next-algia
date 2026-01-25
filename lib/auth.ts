import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type UserRole = 'patient' | 'doctor' | 'admin'

export interface SessionUser {
  id: string
  name: string | null
  email: string | null
  role: UserRole
  representedAgentId: number | null
}

/**
 * Obtem a sessao do usuario atual
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')

  if (!sessionCookie?.value) {
    return null
  }

  try {
    return JSON.parse(sessionCookie.value) as SessionUser
  } catch {
    return null
  }
}

/**
 * Verifica se o usuario esta autenticado e tem o role necessario
 * Redireciona para login se nao estiver autenticado
 */
export async function requireAuth(allowedRoles?: UserRole[]): Promise<SessionUser> {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    // Redireciona para a area correta baseada no role
    switch (session.role) {
      case 'patient':
        redirect('/patient/dashboard')
      case 'doctor':
        redirect('/doctor/dashboard')
      case 'admin':
        redirect('/admin/dashboard')
      default:
        redirect('/login')
    }
  }

  return session
}

/**
 * Verifica se o usuario ja esta logado (para pagina de login)
 */
export async function redirectIfAuthenticated(): Promise<void> {
  const session = await getSession()

  if (session) {
    switch (session.role) {
      case 'patient':
        redirect('/patient/dashboard')
      case 'doctor':
        redirect('/doctor/dashboard')
      case 'admin':
        redirect('/admin/dashboard')
    }
  }
}
