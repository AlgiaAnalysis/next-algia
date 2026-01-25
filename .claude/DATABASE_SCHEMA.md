# Schema do Banco de Dados - Algia

## Visao Geral

O banco de dados usa **MySQL** com **Prisma ORM**. O schema esta definido em `prisma/schema.prisma`.

## Diagrama de Relacionamentos

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │───────│   patients  │───────│doctor_patts │
│             │       │             │       │             │
│ usr_id (PK) │       │ pat_id (PK) │       │             │
│ usr_name    │       │ usr_id (FK) │       └──────┬──────┘
│ usr_email   │       │ streak      │              │
│ usr_password│       │ gender      │              │
│ usr_role    │       │ milestones  │              │
│ usr_cpf     │       └──────┬──────┘              │
└──────┬──────┘              │                     │
       │                     │                     │
       │              ┌──────┴──────┐       ┌──────┴──────┐
       │              │   patient   │       │   doctors   │
       │              │   reports   │       │             │
       │              │             │       │ doc_id (PK) │
       │              │ par_id (PK) │       │ usr_id (FK) │
       │              │ pat_id (FK) │       │ doc_crm     │
       │              │ score       │       └─────────────┘
       │              │ medication  │
       │              └──────┬──────┘
       │                     │
       │              ┌──────┴──────┐
       │              │   report    │
       │              │   answers   │
       │              │             │
       │              │ ran_id (PK) │
       │              │ par_id (FK) │
       │              │ que_id (FK) │
       │              │ ran_answer  │
       │              └──────┬──────┘
       │                     │
       │              ┌──────┴──────┐
       │              │  questions  │
       │              │             │
       │              │ que_id (PK) │
       │              │ que_text    │
       │              │ que_domain  │
       │              │ que_type    │
       │              └─────────────┘
```

## Tabelas Principais

### users

Armazena todos os usuarios do sistema.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `usr_id` | Int (PK) | ID auto-incrementado |
| `usr_name` | String | Nome completo |
| `usr_email` | String (unique) | Email |
| `usr_password` | String | Senha (hash) |
| `usr_role` | Enum | Tipo: patient, doctor, admin |
| `usr_cpf` | String (unique) | CPF |
| `created_at` | DateTime | Data de criacao |
| `updated_at` | DateTime | Ultima atualizacao |

### patients

Dados especificos de pacientes.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `pat_id` | Int (PK) | ID auto-incrementado |
| `usr_id` | Int (FK) | Referencia ao usuario |
| `disease_discover_date` | DateTime? | Data descoberta da doenca |
| `streak` | Int | Dias consecutivos |
| `treatment_status` | String | Status do tratamento |
| `gender` | String? | Genero |
| `milestones` | Json? | Marcos alcancados |

### doctors

Dados especificos de medicos.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `doc_id` | Int (PK) | ID auto-incrementado |
| `usr_id` | Int (FK) | Referencia ao usuario |
| `doc_crm` | String | Numero do CRM |

### doctor_patients

Relacao N:N entre medicos e pacientes.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | Int (PK) | ID auto-incrementado |
| `doc_id` | Int (FK) | Referencia ao medico |
| `pat_id` | Int (FK) | Referencia ao paciente |
| `status` | String | Status da relacao |
| `created_at` | DateTime | Data do vinculo |

### questions

Perguntas dos questionarios.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `que_id` | Int (PK) | ID auto-incrementado |
| `que_text` | String | Texto da pergunta |
| `que_domain` | String | Dominio (dor, sono, etc) |
| `que_type` | String | Tipo de resposta esperada |
| `que_order` | Int | Ordem de exibicao |
| `que_active` | Boolean | Se esta ativa |
| `que_frequency` | String | daily, weekly, monthly |

### patient_reports

Relatorios de periodo (diario, semanal, mensal).

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `par_id` | Int (PK) | ID auto-incrementado |
| `pat_id` | Int (FK) | Referencia ao paciente |
| `period_start` | DateTime | Inicio do periodo |
| `period_end` | DateTime | Fim do periodo |
| `medication` | String? | Medicacoes do periodo |
| `score` | Decimal? | Pontuacao calculada |
| `cli_resume` | Text? | Resumo clinico |
| `created_at` | DateTime | Data de criacao |

### patient_domain_reports

Scores por dominio em cada relatorio.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `pdr_id` | Int (PK) | ID auto-incrementado |
| `par_id` | Int (FK) | Referencia ao relatorio |
| `domain` | String | Nome do dominio |
| `score` | Decimal | Score do dominio |

### report_answers

Respostas individuais das perguntas.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `ran_id` | Int (PK) | ID auto-incrementado |
| `par_id` | Int (FK) | Referencia ao relatorio |
| `que_id` | Int (FK) | Referencia a pergunta |
| `ran_answer` | String | Resposta dada |
| `created_at` | DateTime | Data da resposta |

### appointments

Consultas medicas.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `app_id` | Int (PK) | ID auto-incrementado |
| `doc_id` | Int (FK) | Referencia ao medico |
| `pat_id` | Int (FK) | Referencia ao paciente |
| `app_date` | DateTime | Data da consulta |
| `app_diagnosis` | Text? | Diagnostico |
| `app_notes` | Text? | Observacoes |
| `app_status` | String | Status da consulta |

### appointment_answers

Respostas durante consultas.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `apa_id` | Int (PK) | ID auto-incrementado |
| `app_id` | Int (FK) | Referencia a consulta |
| `que_id` | Int (FK) | Referencia a pergunta |
| `apa_answer` | String | Resposta dada |

### report_comparisons

Comparacoes entre relatorios.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `rco_id` | Int (PK) | ID auto-incrementado |
| `pat_id` | Int (FK) | Referencia ao paciente |
| `rco_analysis` | Text? | Analise gerada |
| `created_at` | DateTime | Data da comparacao |

### reports_in_comparisons

Relatorios incluidos em comparacoes.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | Int (PK) | ID auto-incrementado |
| `rco_id` | Int (FK) | Referencia a comparacao |
| `par_id` | Int (FK) | Referencia ao relatorio |

### appointments_in_comparisons

Consultas incluidas em comparacoes.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | Int (PK) | ID auto-incrementado |
| `rco_id` | Int (FK) | Referencia a comparacao |
| `app_id` | Int (FK) | Referencia a consulta |

## Tabelas de Sistema

### sessions

Sessoes de usuario ativas.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | String (PK) | ID da sessao |
| `usr_id` | Int (FK) | Referencia ao usuario |
| `payload` | Text | Dados da sessao |
| `last_activity` | Int | Timestamp ultima atividade |
| `ip_address` | String? | IP do usuario |
| `user_agent` | Text? | User agent |

### personal_access_tokens

Tokens de API.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `id` | Int (PK) | ID do token |
| `usr_id` | Int (FK) | Referencia ao usuario |
| `name` | String | Nome do token |
| `token` | String (unique) | Hash do token |
| `abilities` | Text? | Permissoes |
| `last_used_at` | DateTime? | Ultimo uso |
| `expires_at` | DateTime? | Expiracao |

### password_reset_tokens

Tokens de recuperacao de senha.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `email` | String (PK) | Email do usuario |
| `token` | String | Token de reset |
| `created_at` | DateTime? | Data de criacao |

### cache / cache_locks

Sistema de cache.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `key` | String (PK) | Chave do cache |
| `value` | Text | Valor armazenado |
| `expiration` | Int | Timestamp de expiracao |

### jobs / job_batches / failed_jobs

Sistema de filas de jobs.

## Indices e Otimizacoes

### Indices Recomendados

```sql
-- Busca de usuarios por email
CREATE INDEX idx_users_email ON users(usr_email);

-- Busca de pacientes por usuario
CREATE INDEX idx_patients_usr_id ON patients(usr_id);

-- Busca de relatorios por paciente e periodo
CREATE INDEX idx_reports_patient_period ON patient_reports(pat_id, period_start);

-- Busca de respostas por relatorio
CREATE INDEX idx_answers_report ON report_answers(par_id);

-- Busca de consultas por data
CREATE INDEX idx_appointments_date ON appointments(app_date);
```

## Convencoes de Nomenclatura

### Tabelas
- Plural em ingles: `users`, `patients`, `doctors`
- Snake_case para nomes compostos: `doctor_patients`, `patient_reports`

### Colunas
- Prefixo de 3 letras da tabela: `usr_`, `pat_`, `doc_`
- IDs: `[prefix]_id` (ex: `usr_id`, `pat_id`)
- Foreign keys: nome da coluna referenciada (ex: `usr_id`, `pat_id`)
- Timestamps: `created_at`, `updated_at`

### Relacionamentos no Prisma

```prisma
model patients {
  pat_id              Int               @id @default(autoincrement())
  usr_id              Int

  // Relacionamento com usuario
  user                users             @relation(fields: [usr_id], references: [usr_id])

  // Relacionamento com relatorios
  patient_reports     patient_reports[]

  // Relacionamento com medicos (N:N)
  doctor_patients     doctor_patients[]
}
```

## Queries Comuns

### Buscar paciente com relatorios recentes

```typescript
const patient = await prisma.patients.findUnique({
  where: { pat_id: id },
  include: {
    user: {
      select: { usr_name: true, usr_email: true }
    },
    patient_reports: {
      orderBy: { period_start: 'desc' },
      take: 5,
      include: {
        report_answers: {
          include: { question: true }
        }
      }
    }
  }
})
```

### Buscar questionario diario ativo

```typescript
const questions = await prisma.questions.findMany({
  where: {
    que_active: true,
    que_frequency: 'daily'
  },
  orderBy: { que_order: 'asc' }
})
```

### Calcular score medio por dominio

```typescript
const domainScores = await prisma.patient_domain_reports.groupBy({
  by: ['domain'],
  where: { par_id: reportId },
  _avg: { score: true }
})
```

## Migracoes

### Criar nova migracao

```bash
npx prisma migrate dev --name descricao_da_mudanca
```

### Aplicar migracoes em producao

```bash
npx prisma migrate deploy
```

### Resetar banco de desenvolvimento

```bash
npx prisma migrate reset
```

## Seeds

Dados iniciais podem ser inseridos via `prisma/seed.ts`:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Criar perguntas padrao
  await prisma.questions.createMany({
    data: [
      {
        que_text: 'De 1 a 10, qual seu nivel de dor hoje?',
        que_domain: 'pain',
        que_type: 'scale_1_10',
        que_order: 1,
        que_active: true,
        que_frequency: 'daily'
      },
      // ... mais perguntas
    ]
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Executar seed:

```bash
npx prisma db seed
```
