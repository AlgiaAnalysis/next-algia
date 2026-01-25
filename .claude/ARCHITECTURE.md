# Arquitetura do Projeto - Algia

## Visao Geral

O Algia e um sistema de rastreio e acompanhamento de pacientes com condicoes cronicas como fibromialgia. A arquitetura segue o padrao de separacao de responsabilidades com camadas bem definidas.

## Stack Tecnologica

| Tecnologia | Versao | Proposito |
|------------|--------|-----------|
| Next.js | 16.x | Framework full-stack com App Router |
| React | 19.x | Biblioteca de UI |
| TypeScript | 5.x | Tipagem estatica |
| Prisma | 7.x | ORM para banco de dados |
| MySQL | - | Banco de dados relacional |
| Tailwind CSS | 4.x | Estilizacao |
| shadcn/ui | - | Componentes de UI |

## Estrutura de Pastas

```
next-algia/
├── app/                    # App Router do Next.js
│   ├── api/               # Rotas de API (endpoints REST)
│   │   └── [entidade]/
│   │       └── route.ts   # Handlers HTTP (GET, POST, PUT, DELETE)
│   ├── (auth)/            # Grupo de rotas autenticadas
│   ├── (public)/          # Grupo de rotas publicas
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Pagina inicial
│
├── components/            # Componentes React
│   ├── ui/               # Componentes base do shadcn/ui
│   ├── forms/            # Componentes de formulario
│   ├── charts/           # Componentes de graficos
│   └── shared/           # Componentes compartilhados
│
├── controllers/          # Camada de acesso ao banco de dados
│   └── [Entidade].controller.ts
│
├── lib/                  # Utilitarios e configuracoes
│   ├── prisma.ts        # Instancia singleton do Prisma
│   └── utils.ts         # Funcoes utilitarias
│
├── types/               # Definicoes de tipos TypeScript
│   └── index.ts         # Re-exporta tipos do Prisma
│
├── hooks/               # React Hooks customizados
│
├── prisma/              # Configuracao do Prisma
│   └── schema.prisma    # Schema do banco de dados
│
└── .claude/             # Documentacao do projeto
```

## Padrao de Arquitetura: Controllers

### Principio

Todas as operacoes com o banco de dados devem ser feitas atraves de **Controllers**. Cada entidade do banco possui seu proprio controller com metodos estaticos.

### Estrutura de um Controller

```typescript
// controllers/Patient.controller.ts
import { prisma } from '@/lib/prisma'
import type { patients, Prisma } from '@prisma/client'

export class PatientController {
  /**
   * Busca todos os pacientes
   */
  static async findAll(): Promise<patients[]> {
    return prisma.patients.findMany()
  }

  /**
   * Busca um paciente por ID
   */
  static async findById(id: number): Promise<patients | null> {
    return prisma.patients.findUnique({
      where: { pat_id: id }
    })
  }

  /**
   * Cria um novo paciente
   */
  static async create(data: Prisma.patientsCreateInput): Promise<patients> {
    return prisma.patients.create({ data })
  }

  /**
   * Atualiza um paciente
   */
  static async update(
    id: number,
    data: Prisma.patientsUpdateInput
  ): Promise<patients> {
    return prisma.patients.update({
      where: { pat_id: id },
      data
    })
  }

  /**
   * Remove um paciente
   */
  static async delete(id: number): Promise<patients> {
    return prisma.patients.delete({
      where: { pat_id: id }
    })
  }
}
```

### Controllers Necessarios

| Controller | Entidade | Responsabilidade |
|------------|----------|------------------|
| `UserController` | users | Gerenciamento de usuarios |
| `PatientController` | patients | Gerenciamento de pacientes |
| `DoctorController` | doctors | Gerenciamento de medicos |
| `QuestionController` | questions | Gerenciamento de perguntas |
| `ReportController` | patient_reports | Relatorios de pacientes |
| `AppointmentController` | appointments | Consultas medicas |
| `AnswerController` | report_answers | Respostas de questionarios |

## Fluxo de Dados

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────┐
│   Cliente   │────▶│  API Route  │────▶│  Controller  │────▶│  Prisma  │
│  (Browser)  │     │  (app/api)  │     │ (controllers)│     │   (DB)   │
└─────────────┘     └─────────────┘     └──────────────┘     └──────────┘
       ▲                   │
       │                   │
       └───────────────────┘
            Response JSON
```

### Exemplo de Fluxo Completo

1. **Cliente** faz requisicao POST para `/api/patients`
2. **API Route** (`app/api/patients/route.ts`) recebe a requisicao
3. **API Route** chama `PatientController.create(data)`
4. **Controller** usa Prisma para inserir no banco
5. **Controller** retorna o paciente criado
6. **API Route** retorna JSON para o cliente

### Exemplo de API Route

```typescript
// app/api/patients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PatientController } from '@/controllers/Patient.controller'

export async function GET() {
  try {
    const patients = await PatientController.findAll()
    return NextResponse.json(patients)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar pacientes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const patient = await PatientController.create(data)
    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar paciente' },
      { status: 500 }
    )
  }
}
```

## Convencoes de Nomenclatura

### Arquivos

| Tipo | Padrao | Exemplo |
|------|--------|---------|
| Controllers | `PascalCase.controller.ts` | `Patient.controller.ts` |
| Componentes | `PascalCase.tsx` | `PatientCard.tsx` |
| Hooks | `camelCase.ts` | `usePatientData.ts` |
| Utilitarios | `camelCase.ts` | `formatDate.ts` |
| API Routes | `route.ts` | `app/api/patients/route.ts` |

### Codigo

| Tipo | Padrao | Exemplo |
|------|--------|---------|
| Classes | PascalCase | `PatientController` |
| Metodos estaticos | camelCase | `findById()` |
| Variaveis | camelCase | `patientData` |
| Constantes | UPPER_SNAKE_CASE | `MAX_QUESTIONS` |
| Tipos/Interfaces | PascalCase | `PatientResponse` |

## Tratamento de Erros

### Padrao nas API Routes

```typescript
export async function GET() {
  try {
    const data = await Controller.method()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro descritivo:', error)
    return NextResponse.json(
      { error: 'Mensagem amigavel para o usuario' },
      { status: 500 }
    )
  }
}
```

### Codigos HTTP Utilizados

| Codigo | Uso |
|--------|-----|
| 200 | Sucesso em GET/PUT |
| 201 | Sucesso em POST (criacao) |
| 204 | Sucesso em DELETE |
| 400 | Dados invalidos |
| 401 | Nao autenticado |
| 403 | Sem permissao |
| 404 | Recurso nao encontrado |
| 500 | Erro interno do servidor |

## Autenticacao e Autorizacao

### Roles de Usuario

| Role | Descricao |
|------|-----------|
| `patient` | Paciente - acesso aos seus questionarios e dados |
| `doctor` | Medico - acesso aos pacientes vinculados |
| `admin` | Administrador - acesso total |

### Protecao de Rotas

As rotas protegidas devem verificar a sessao do usuario antes de processar a requisicao.

## Proximos Passos

1. Implementar todos os Controllers
2. Criar rotas de API para cada entidade
3. Implementar autenticacao com NextAuth ou similar
4. Criar componentes de UI para questionarios
5. Implementar dashboard do paciente
6. Criar sistema de relatorios
