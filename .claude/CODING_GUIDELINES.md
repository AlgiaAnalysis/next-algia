# Diretrizes de Codigo - Algia

## Principios Gerais

1. **Simplicidade**: Codigo simples e legivel
2. **Consistencia**: Seguir padroes estabelecidos
3. **Tipagem**: TypeScript strict em todo o projeto
4. **Separacao**: Cada camada com sua responsabilidade

## TypeScript

### Configuracao

O projeto usa TypeScript em modo strict. Todas as configuracoes estao em `tsconfig.json`.

### Regras

```typescript
// CORRETO: Tipar explicitamente parametros e retornos
async function findPatient(id: number): Promise<Patient | null> {
  return prisma.patients.findUnique({ where: { pat_id: id } })
}

// EVITAR: any e unknown sem necessidade
function processData(data: any) { } // NAO

// CORRETO: Usar tipos do Prisma
import type { patients, Prisma } from '@prisma/client'

// CORRETO: Criar tipos quando necessario
interface PatientWithReports extends patients {
  reports: patient_reports[]
}
```

### Imports

```typescript
// Ordem dos imports:
// 1. Modulos externos
import { NextRequest, NextResponse } from 'next/server'

// 2. Modulos internos (alias @/)
import { PatientController } from '@/controllers/Patient.controller'
import { cn } from '@/lib/utils'

// 3. Tipos (com type keyword)
import type { patients } from '@prisma/client'
```

## Controllers

### Estrutura Padrao

```typescript
// controllers/Example.controller.ts
import { prisma } from '@/lib/prisma'
import type { example, Prisma } from '@prisma/client'

export class ExampleController {
  /**
   * Descricao do metodo
   */
  static async findAll(): Promise<example[]> {
    return prisma.example.findMany()
  }

  static async findById(id: number): Promise<example | null> {
    return prisma.example.findUnique({
      where: { id }
    })
  }

  static async create(data: Prisma.exampleCreateInput): Promise<example> {
    return prisma.example.create({ data })
  }

  static async update(
    id: number,
    data: Prisma.exampleUpdateInput
  ): Promise<example> {
    return prisma.example.update({
      where: { id },
      data
    })
  }

  static async delete(id: number): Promise<example> {
    return prisma.example.delete({
      where: { id }
    })
  }
}
```

### Regras para Controllers

1. **Metodos estaticos**: Todos os metodos devem ser estaticos
2. **Sem logica de negocio complexa**: Apenas operacoes CRUD
3. **Retornos tipados**: Sempre tipar Promise com o tipo correto
4. **Queries otimizadas**: Usar `select` e `include` quando necessario

```typescript
// BOM: Query otimizada
static async findWithReports(id: number) {
  return prisma.patients.findUnique({
    where: { pat_id: id },
    include: {
      patient_reports: {
        orderBy: { period_start: 'desc' },
        take: 10
      }
    }
  })
}

// EVITAR: Buscar tudo e filtrar no JS
static async findWithReports(id: number) {
  const patient = await prisma.patients.findUnique({ where: { pat_id: id } })
  const reports = await prisma.patient_reports.findMany({ where: { pat_id: id } })
  return { ...patient, reports } // NAO
}
```

## API Routes

### Estrutura Padrao

```typescript
// app/api/[entidade]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ExampleController } from '@/controllers/Example.controller'

export async function GET(request: NextRequest) {
  try {
    const data = await ExampleController.findAll()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/example]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validacao basica
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Campo obrigatorio ausente' },
        { status: 400 }
      )
    }

    const data = await ExampleController.create(body)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[POST /api/example]', error)
    return NextResponse.json(
      { error: 'Erro ao criar registro' },
      { status: 500 }
    )
  }
}
```

### Rotas Dinamicas

```typescript
// app/api/[entidade]/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ExampleController } from '@/controllers/Example.controller'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const data = await ExampleController.findById(Number(id))

    if (!data) {
      return NextResponse.json(
        { error: 'Registro nao encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/example/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao buscar registro' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const data = await ExampleController.update(Number(id), body)
    return NextResponse.json(data)
  } catch (error) {
    console.error('[PUT /api/example/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar registro' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await ExampleController.delete(Number(id))
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[DELETE /api/example/:id]', error)
    return NextResponse.json(
      { error: 'Erro ao deletar registro' },
      { status: 500 }
    )
  }
}
```

## Componentes React

### Estrutura de Componente

```typescript
// components/shared/PatientCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { patients } from '@prisma/client'

interface PatientCardProps {
  patient: patients
  className?: string
  onSelect?: (id: number) => void
}

export function PatientCard({
  patient,
  className,
  onSelect
}: PatientCardProps) {
  return (
    <Card
      className={cn('cursor-pointer hover:shadow-md', className)}
      onClick={() => onSelect?.(patient.pat_id)}
    >
      <CardHeader>
        <CardTitle>{patient.usr_id}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Status: {patient.treatment_status}</p>
        <p>Streak: {patient.streak} dias</p>
      </CardContent>
    </Card>
  )
}
```

### Regras para Componentes

1. **Functional components**: Sempre usar funcoes
2. **Props tipadas**: Interface para props
3. **Composicao**: Preferir composicao a heranca
4. **Hooks**: Extrair logica para hooks customizados

```typescript
// hooks/usePatientData.ts
import { useState, useEffect } from 'react'
import type { patients } from '@prisma/client'

export function usePatientData(patientId: number) {
  const [patient, setPatient] = useState<patients | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchPatient() {
      try {
        const response = await fetch(`/api/patients/${patientId}`)
        if (!response.ok) throw new Error('Falha ao carregar')
        const data = await response.json()
        setPatient(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [patientId])

  return { patient, loading, error }
}
```

## Estilizacao

### Tailwind CSS

O projeto usa Tailwind CSS v4. Toda estilizacao deve ser feita com classes Tailwind.

```typescript
// CORRETO: Usar Tailwind
<div className="flex items-center gap-4 p-4 rounded-lg bg-card">
  <span className="text-lg font-semibold text-foreground">
    Titulo
  </span>
</div>

// EVITAR: CSS inline ou arquivos .css separados
<div style={{ display: 'flex', padding: '16px' }}> // NAO
```

### Funcao cn()

Usar a funcao `cn()` para combinar classes condicionais:

```typescript
import { cn } from '@/lib/utils'

// Uso basico
<div className={cn('base-class', conditional && 'conditional-class')} />

// Com variantes
<button
  className={cn(
    'px-4 py-2 rounded-md font-medium',
    variant === 'primary' && 'bg-primary text-primary-foreground',
    variant === 'secondary' && 'bg-secondary text-secondary-foreground',
    disabled && 'opacity-50 cursor-not-allowed'
  )}
/>
```

### Variaveis CSS

O projeto usa variaveis CSS para temas. Estao definidas em `app/globals.css`:

```css
/* Cores disponiveis via Tailwind */
bg-background    /* Fundo principal */
bg-card          /* Fundo de cards */
bg-primary       /* Cor primaria */
bg-secondary     /* Cor secundaria */
bg-muted         /* Cor suave */
bg-accent        /* Cor de destaque */
bg-destructive   /* Cor de erro/perigo */

/* Texto */
text-foreground
text-muted-foreground
text-primary-foreground

/* Bordas */
border-border
border-input
```

### shadcn/ui

Usar componentes do shadcn/ui como base:

```typescript
// Importar de @/components/ui
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog'
```

## Tratamento de Erros

### No Cliente

```typescript
async function handleSubmit(data: FormData) {
  try {
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erro desconhecido')
    }

    const result = await response.json()
    // Sucesso
  } catch (error) {
    // Mostrar erro ao usuario
    console.error(error)
  }
}
```

### No Servidor

```typescript
export async function POST(request: NextRequest) {
  try {
    // ... logica
  } catch (error) {
    // Log detalhado no servidor
    console.error('[POST /api/endpoint]', {
      error,
      timestamp: new Date().toISOString()
    })

    // Resposta generica para o cliente
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
```

## Validacao de Dados

### Validacao Basica nas Rotas

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json()

  // Validar campos obrigatorios
  const requiredFields = ['name', 'email', 'cpf']
  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Campo '${field}' e obrigatorio` },
        { status: 400 }
      )
    }
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    return NextResponse.json(
      { error: 'Email invalido' },
      { status: 400 }
    )
  }

  // Continuar com a criacao...
}
```

## Comentarios

```typescript
// Comentarios devem explicar o PORQUE, nao o QUE

// EVITAR: Comentario obvio
// Busca o paciente pelo ID
const patient = await PatientController.findById(id)

// CORRETO: Explica decisao de design
// Busca apenas os ultimos 10 relatorios para evitar sobrecarga
// em pacientes com historico longo
const reports = await ReportController.findByPatient(id, { limit: 10 })
```

## Git

### Commits

```bash
# Formato: tipo: descricao curta
git commit -m "feat: adiciona endpoint de criacao de pacientes"
git commit -m "fix: corrige validacao de CPF"
git commit -m "refactor: extrai logica de score para utils"

# Tipos comuns:
# feat: nova funcionalidade
# fix: correcao de bug
# refactor: refatoracao sem mudanca de comportamento
# docs: documentacao
# style: formatacao
# test: testes
```

### Branches

```bash
# Formato: tipo/descricao-curta
git checkout -b feat/questionario-diario
git checkout -b fix/calculo-score
git checkout -b refactor/controllers
```
