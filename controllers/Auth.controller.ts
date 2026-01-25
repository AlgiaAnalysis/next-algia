import { prisma } from '@/lib/prisma'
import type { users, patients, doctors } from '@prisma/client'
import { TripleDES } from '@/lib/crypto/tripleDES'

export type UserRole = 'patient' | 'doctor' | 'admin'

export interface RegisterPatientData {
    name: string
    email: string
    cpf: string
    password: string
    gender?: string
    diseaseDiscoverDate?: string
}

export interface RegisterDoctorData {
    name: string
    email: string
    cpf: string
    password: string
    crm: string
}

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

        const isPasswordValid = password === user.usr_password

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

    /**
     * Verifica se um email ja esta cadastrado
     */
    static async emailExists(email: string): Promise<boolean> {
        const user = await prisma.users.findUnique({
            where: { usr_email: email }
        })
        return !!user
    }

    /**
     * Verifica se um CPF ja esta cadastrado
     */
    static async cpfExists(cpf: string): Promise<boolean> {
        const user = await prisma.users.findFirst({
            where: { usr_cpf: cpf }
        })
        return !!user
    }

    /**
     * Registra um novo paciente
     * Cria primeiro o registro de patient, depois o registro de user vinculado
     */
    static async registerPatient(data: RegisterPatientData): Promise<{
        success: boolean
        user?: users
        patient?: patients
        error?: string
    }> {
        const tripleDES = new TripleDES()

        // Verifica se email ja existe
        if (await this.emailExists(data.email)) {
            return {
                success: false,
                error: 'Email ja cadastrado'
            }
        }

        // Verifica se CPF ja existe
        if (await this.cpfExists(data.cpf)) {
            return {
                success: false,
                error: 'CPF ja cadastrado'
            }
        }

        try {
            // Criptografa a senha
            //const encryptedPassword = tripleDES.encrypt(data.password)
            const encryptedPassword = data.password

            // Usa transacao para garantir consistencia
            const result = await prisma.$transaction(async (tx) => {
                // Cria o registro do paciente
                const patient = await tx.patients.create({
                    data: {
                        pat_gender: data.gender || null,
                        pat_disease_discover_date: data.diseaseDiscoverDate
                            ? new Date(data.diseaseDiscoverDate)
                            : null,
                        pat_stopped_treatment: false,
                        pat_streak: 0,
                        pat_gave_informed_diagnosis: false,
                        pat_hundred_days: false,
                        pat_two_hundred_days: false,
                        pat_three_hundred_days: false
                    }
                })

                // Cria o registro do usuario vinculado ao paciente
                const user = await tx.users.create({
                    data: {
                        usr_name: data.name,
                        usr_email: data.email,
                        usr_cpf: data.cpf,
                        usr_password: encryptedPassword,
                        usr_role: 'patient',
                        usr_represented_agent: Number(patient.pat_id),
                        usr_created_at: new Date(),
                        usr_updated_at: new Date()
                    }
                })

                return { user, patient }
            })

            return {
                success: true,
                user: result.user,
                patient: result.patient
            }
        } catch (error) {
            console.error('[AuthController.registerPatient]', error)
            return {
                success: false,
                error: 'Erro ao criar conta. Tente novamente.'
            }
        }
    }

    /**
     * Verifica se um CRM ja esta cadastrado
     */
    static async crmExists(crm: string): Promise<boolean> {
        const doctor = await prisma.doctors.findFirst({
            where: { doc_crm: crm }
        })
        return !!doctor
    }

    /**
     * Registra um novo medico
     * Cria primeiro o registro de doctor, depois o registro de user vinculado
     */
    static async registerDoctor(data: RegisterDoctorData): Promise<{
        success: boolean
        user?: users
        doctor?: doctors
        error?: string
    }> {
        // Verifica se email ja existe
        if (await this.emailExists(data.email)) {
            return {
                success: false,
                error: 'Email ja cadastrado'
            }
        }

        // Verifica se CPF ja existe
        if (await this.cpfExists(data.cpf)) {
            return {
                success: false,
                error: 'CPF ja cadastrado'
            }
        }

        // Verifica se CRM ja existe
        if (await this.crmExists(data.crm)) {
            return {
                success: false,
                error: 'CRM ja cadastrado'
            }
        }

        try {
            // Senha em texto plano (igual ao paciente)
            const encryptedPassword = data.password

            // Usa transacao para garantir consistencia
            const result = await prisma.$transaction(async (tx) => {
                // Cria o registro do medico
                const doctor = await tx.doctors.create({
                    data: {
                        doc_crm: data.crm
                    }
                })

                // Cria o registro do usuario vinculado ao medico
                const user = await tx.users.create({
                    data: {
                        usr_name: data.name,
                        usr_email: data.email,
                        usr_cpf: data.cpf,
                        usr_password: encryptedPassword,
                        usr_role: 'doctor',
                        usr_represented_agent: Number(doctor.doc_id),
                        usr_created_at: new Date(),
                        usr_updated_at: new Date()
                    }
                })

                return { user, doctor }
            })

            return {
                success: true,
                user: result.user,
                doctor: result.doctor
            }
        } catch (error) {
            console.error('[AuthController.registerDoctor]', error)
            return {
                success: false,
                error: 'Erro ao criar conta. Tente novamente.'
            }
        }
    }
}
