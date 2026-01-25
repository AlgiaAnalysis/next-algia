import { NextRequest, NextResponse } from 'next/server'
import { AuthController } from '@/controllers/Auth.controller'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/crypto/tripleDES'
import { passwordDecrypt } from '@/lib/crypto/password'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validacao basica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha sao obrigatorios' },
        { status: 400 }
      )
    }

    // Debug: busca usuario e tenta descriptografar
    const user = await AuthController.findByEmail(email)
    if (user?.usr_password) {
      console.log('[DEBUG] Senha criptografada do banco:', user.usr_password.substring(0, 50) + '...')
      try {
        const afterPasswordDecrypt = passwordDecrypt(user.usr_password)
        console.log('[DEBUG] Apos passwordDecrypt (base64):', afterPasswordDecrypt)
        const decryptedPwd = decrypt(user.usr_password)
        console.log('[DEBUG] Senha descriptografada:', decryptedPwd)
        console.log('[DEBUG] Senha fornecida:', password)
        console.log('[DEBUG] Match:', decryptedPwd === password)
      } catch (err) {
        console.log('[DEBUG] Erro ao descriptografar:', err)
      }
    }

    // Tenta fazer o login
    const result = await AuthController.login(email, password)

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: result.error || 'Erro ao fazer login' },
        { status: 401 }
      )
    }

    // Cria os dados da sessao
    const sessionData = {
      id: result.user.id.toString(),
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      representedAgentId: result.user.representedAgentId
    }

    // Armazena a sessao em um cookie
    const cookieStore = await cookies()
    cookieStore.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/'
    })

    // Define a rota de redirecionamento baseada no role
    let redirectTo = '/'
    switch (result.user.role) {
      case 'patient':
        redirectTo = '/patient/dashboard'
        break
      case 'doctor':
        redirectTo = '/doctor/dashboard'
        break
      case 'admin':
        redirectTo = '/admin/dashboard'
        break
    }

    return NextResponse.json({
      success: true,
      user: sessionData,
      redirectTo
    })
  } catch (error) {
    console.error('[POST /api/auth/login]', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
