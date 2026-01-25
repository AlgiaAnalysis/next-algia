import { NextRequest, NextResponse } from 'next/server'
import { AuthController, RegisterPatientData } from '@/controllers/Auth.controller'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, cpf, password, gender, diseaseDiscoverDate } = body

        // Validacao basica
        if (!name || !email || !cpf || !password) {
            return NextResponse.json(
                { error: 'Nome, email, CPF e senha sao obrigatorios' },
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

        // Prepara os dados para registro
        const registerData: RegisterPatientData = {
            name,
            email,
            cpf: cpfClean,
            password,
            gender: gender || undefined,
            diseaseDiscoverDate: diseaseDiscoverDate || undefined
        }

        // Tenta registrar o paciente
        const result = await AuthController.registerPatient(registerData)

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
        console.error('[POST /api/patients/register]', error)
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}
