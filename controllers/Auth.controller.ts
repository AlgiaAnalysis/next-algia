import { prisma } from '@/lib/prisma'
import { comparePassword, decrypt } from '@/lib/crypto/tripleDES'
import type { users, patients, doctors } from '@prisma/client'

export type UserRole = 'patient' | 'doctor' | 'admin'

export interface AuthenticatedUser {
    id: bigint
    name: string | null
    email: string | null
    role: UserRole
    representedAgentId: number | null
}

export interface LoginResult {
    success: boolean
    user?: AuthenticatedUser
    error?: string
    decryptedPassword?: string
}

export class AuthController {
    /**
     * Busca um usuario pelo email
     */
    static async findByEmail(email: string): Promise<users | null> {
        return prisma.users.findUnique({
            where: { usr_email: email }
        })
    }

    /**
     * Busca dados do paciente vinculado ao usuario
     */
    static async getPatientData(patientId: number): Promise<patients | null> {
        return prisma.patients.findUnique({
            where: { pat_id: BigInt(patientId) }
        })
    }

    /**
     * Busca dados do medico vinculado ao usuario
     */
    static async getDoctorData(doctorId: number): Promise<doctors | null> {
        return prisma.doctors.findUnique({
            where: { doc_id: BigInt(doctorId) }
        })
    }

    /**
     * Realiza o login do usuario
     */
    static async login(email: string, password: string): Promise<LoginResult> {
        // Busca o usuario pelo email
        const user = await this.findByEmail(email)

        if (!user) {
            return {
                success: false,
                error: 'Usuario nao encontrado'
            }
        }

        // Verifica a senha
        if (!user.usr_password) {
            return {
                success: false,
                error: 'Senha nao configurada'
            }
        }

        const isPasswordValid = comparePassword(password, user.usr_password)

        if (!isPasswordValid) {
            return {
                success: false,
                error: 'Senha incorreta',
            }
        }

        // Valida o role do usuario
        const validRoles: UserRole[] = ['patient', 'doctor', 'admin']
        const userRole = user.usr_role as UserRole

        if (!userRole || !validRoles.includes(userRole)) {
            return {
                success: false,
                error: 'Tipo de usuario invalido'
            }
        }

        // Retorna os dados do usuario autenticado
        return {
            success: true,
            user: {
                id: user.usr_id,
                name: user.usr_name,
                email: user.usr_email,
                role: userRole,
                representedAgentId: user.usr_represented_agent
            }
        }
    }

    /**
     * Valida se um usuario tem acesso a uma determinada rota
     */
    static validateAccess(userRole: UserRole, requiredRoles: UserRole[]): boolean {
        return requiredRoles.includes(userRole)
    }
}
