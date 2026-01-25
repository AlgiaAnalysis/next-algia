import { NextRequest, NextResponse } from 'next/server'
import { AuthController, RegisterDoctorData } from '@/controllers/Auth.controller'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, cpf, password, crm } = body

        // Validacao basica
        if (!name || !email || !cpf || !password || !crm) {
            return NextResponse.json(
                { error: 'Nome, email, CPF, senha e CRM sao obrigatorios' },
                { status: 400 }
            )
        }

        // Valida formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Email invalido' },
                { status: 400 }
            )
        }

        // Valida tamanho minimo da senha
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Senha deve ter pelo menos 6 caracteres' },
                { status: 400 }
            )
        }

        // Valida formato do CPF (apenas numeros, 11 digitos)
        const cpfClean = cpf.replace(/\D/g, '')
        if (cpfClean.length !== 11) {
            return NextResponse.json(
                { error: 'CPF invalido' },
                { status: 400 }
            )
        }

        // Valida CRM (minimo 4 caracteres)
        if (crm.trim().length < 4) {
            return NextResponse.json(
                { error: 'CRM invalido' },
                { status: 400 }
            )
        }

        // Prepara os dados para registro
        const registerData: RegisterDoctorData = {
            name,
            email,
            cpf: cpfClean,
            password,
            crm: crm.trim()
        }

        // Tenta registrar o medico
        const result = await AuthController.registerDoctor(registerData)

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Erro ao criar conta' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Conta criada com sucesso'
        }, { status: 201 })
    } catch (error) {
        console.error('[POST /api/doctors/register]', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
