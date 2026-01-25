# Documentacao do Projeto Algia

Este diretorio contem toda a documentacao tecnica e de negocios do projeto Algia - Sistema de Rastreio e Acompanhamento de Pacientes com Fibromialgia.

## Arquivos de Documentacao

| Arquivo | Descricao |
|---------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura do sistema, estrutura de pastas, fluxo de dados e padroes de projeto |
| [BUSINESS_RULES.md](./BUSINESS_RULES.md) | Regras de negocio, entidades, questionarios, scores e permissoes |
| [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) | Padroes de codigo, TypeScript, controllers, API routes e componentes |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | Schema do banco de dados, tabelas, relacionamentos e queries |
| [UI_GUIDELINES.md](./UI_GUIDELINES.md) | Diretrizes de UI/UX, componentes shadcn/ui, Tailwind e acessibilidade |

## Visao Geral do Projeto

### Objetivo
Sistema para pacientes com condicoes cronicas (fibromialgia) monitorarem sua saude atraves de questionarios diarios, semanais e mensais.

### Stack Principal
- **Frontend**: Next.js 16, React 19, TypeScript
- **Estilizacao**: Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API Routes
- **Banco de Dados**: MySQL com Prisma ORM

### Arquitetura

```
Cliente (Browser)
       │
       ▼
  API Routes (app/api/)
       │
       ▼
  Controllers (controllers/)
       │
       ▼
    Prisma
       │
       ▼
    MySQL
```

## Padroes Chave

### 1. Controllers
Todas operacoes de banco via classes estaticas em `controllers/`

### 2. API Routes
Endpoints REST em `app/api/` chamando controllers

### 3. Componentes
UI com shadcn/ui, estilizacao apenas com Tailwind

### 4. Tipagem
TypeScript strict, tipos do Prisma reutilizados

## Referencia Rapida

### Criar novo Controller

```typescript
// controllers/Example.controller.ts
import { prisma } from '@/lib/prisma'

export class ExampleController {
  static async findAll() { return prisma.example.findMany() }
  static async findById(id: number) { return prisma.example.findUnique({ where: { id } }) }
  static async create(data) { return prisma.example.create({ data }) }
  static async update(id, data) { return prisma.example.update({ where: { id }, data }) }
  static async delete(id) { return prisma.example.delete({ where: { id } }) }
}
```

### Criar nova API Route

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ExampleController } from '@/controllers/Example.controller'

export async function GET() {
  const data = await ExampleController.findAll()
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const data = await ExampleController.create(body)
  return NextResponse.json(data, { status: 201 })
}
```

### Criar novo Componente

```typescript
// components/shared/ExampleCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface ExampleCardProps {
  title: string
  children: React.ReactNode
}

export function ExampleCard({ title, children }: ExampleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
```

## Para Agentes Claude

Ao trabalhar neste projeto:

1. **Leia a documentacao relevante** antes de fazer alteracoes
2. **Siga os padroes estabelecidos** nos guidelines
3. **Use controllers** para todas operacoes de banco
4. **Estilize com Tailwind** - evite CSS customizado
5. **Mantenha tipagem forte** em todo o codigo
6. **Atualize a documentacao** quando adicionar novas features

## Comandos Uteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Prisma
npx prisma generate     # Gerar cliente
npx prisma migrate dev  # Criar migracao
npx prisma studio       # Interface visual
```
