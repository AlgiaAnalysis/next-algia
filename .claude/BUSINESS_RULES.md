# Regras de Negocio - Algia

## Visao Geral do Sistema

O Algia e um sistema de rastreio e acompanhamento de pacientes com condicoes cronicas, especialmente **fibromialgia**. O objetivo principal e permitir que pacientes monitorem sua condicao atraves de questionarios periodicos, gerando dados para analise pessoal e acompanhamento medico.

## Entidades Principais

### 1. Usuarios (users)

#### Regras
- Todo usuario deve ter email unico
- CPF e obrigatorio e deve ser valido
- Senhas devem ser armazenadas com hash seguro
- Roles disponiveis: `patient`, `doctor`, `admin`

#### Campos Obrigatorios
- `usr_name`: Nome completo
- `usr_email`: Email (unico)
- `usr_password`: Senha (hash)
- `usr_cpf`: CPF (unico)
- `usr_role`: Tipo de usuario

### 2. Pacientes (patients)

#### Regras
- Um paciente esta vinculado a exatamente um usuario
- A data de descoberta da doenca (`disease_discover_date`) e informativa
- O `streak` representa dias consecutivos respondendo questionarios
- Status de tratamento (`treatment_status`) pode ser: `active`, `paused`, `completed`

#### Campos Importantes
- `disease_discover_date`: Quando descobriu a condicao
- `streak`: Dias consecutivos de uso
- `treatment_status`: Status atual do tratamento
- `gender`: Genero do paciente
- `milestones`: Marcos importantes no tratamento

### 3. Medicos (doctors)

#### Regras
- Um medico esta vinculado a exatamente um usuario
- CRM e obrigatorio e deve ser valido
- Um medico pode ter varios pacientes vinculados

### 4. Relacao Medico-Paciente (doctor_patients)

#### Regras
- Um paciente pode ter varios medicos
- Um medico pode ter varios pacientes
- A relacao tem status: `active`, `pending`, `inactive`
- O vinculo deve ser aceito por ambas as partes

## Sistema de Questionarios

### Tipos de Questionarios

| Tipo | Frequencia | Proposito |
|------|------------|-----------|
| Diario | Todo dia | Monitoramento de sintomas imediatos |
| Semanal | 1x por semana | Analise de padroes semanais |
| Mensal | 1x por mes | Visao geral e comparativo |

### Perguntas (questions)

#### Regras
- Perguntas sao armazenadas no banco de dados
- Cada pergunta pertence a um **dominio** (ex: dor, sono, humor)
- Perguntas podem ser ativas ou inativas
- O tipo de resposta define o formato esperado

#### Dominios de Perguntas

| Dominio | Descricao | Exemplos |
|---------|-----------|----------|
| `pain` | Nivel de dor | Intensidade, localizacao |
| `sleep` | Qualidade do sono | Horas dormidas, qualidade |
| `mood` | Estado emocional | Ansiedade, depressao |
| `fatigue` | Fadiga | Nivel de energia |
| `mobility` | Mobilidade | Limitacoes fisicas |
| `medication` | Medicacao | Adesao ao tratamento |

#### Tipos de Resposta

| Tipo | Descricao | Exemplo |
|------|-----------|---------|
| `scale_1_10` | Escala numerica | "Nivel de dor de 1 a 10" |
| `yes_no` | Booleano | "Tomou medicacao hoje?" |
| `multiple_choice` | Multipla escolha | "Como foi seu sono?" |
| `text` | Texto livre | "Descreva seus sintomas" |
| `time` | Horario | "Que horas acordou?" |
| `number` | Numero | "Quantas horas dormiu?" |

### Respostas (report_answers)

#### Regras
- Cada resposta esta vinculada a uma pergunta e um relatorio
- A resposta deve ser do tipo esperado pela pergunta
- Respostas nao podem ser editadas apos 24 horas
- Todas as respostas sao timestamped

### Relatorios (patient_reports)

#### Regras
- Um relatorio representa um periodo (diario, semanal, mensal)
- Contem todas as respostas do periodo
- Calcula um `score` geral baseado nas respostas
- Pode conter `cli_resume` (resumo clinico gerado)
- Registra medicacoes do periodo

#### Campos
- `period_start`: Inicio do periodo
- `period_end`: Fim do periodo
- `medication`: Medicacoes utilizadas
- `score`: Pontuacao calculada
- `cli_resume`: Resumo clinico (pode ser gerado por IA)

## Calculo de Scores

### Score por Dominio

Cada dominio tem um score individual calculado:

```
Score do Dominio = (Soma das respostas normalizadas) / (Total de perguntas do dominio)
```

### Score Geral

O score geral do relatorio e uma media ponderada dos dominios:

| Dominio | Peso |
|---------|------|
| Dor | 30% |
| Sono | 20% |
| Humor | 20% |
| Fadiga | 15% |
| Mobilidade | 15% |

### Interpretacao dos Scores

| Score | Classificacao | Indicacao |
|-------|---------------|-----------|
| 0-3 | Critico | Necessita atencao imediata |
| 4-5 | Ruim | Abaixo do esperado |
| 6-7 | Moderado | Estavel |
| 8-9 | Bom | Evolucao positiva |
| 10 | Excelente | Otimo controle |

## Sistema de Streak

### Regras
- O streak aumenta quando o paciente responde questionarios consecutivamente
- Streak diario: responder o questionario diario
- Se pular um dia, o streak e resetado para 0
- Marcos (milestones) sao registrados em: 7, 30, 90, 180, 365 dias

### Gamificacao
- Notificacoes de lembrete para manter o streak
- Badges/conquistas para marcos alcancados
- Historico de streaks anteriores

## Consultas Medicas (appointments)

### Regras
- Uma consulta vincula medico e paciente
- Pode ter perguntas especificas respondidas
- O diagnostico (`app_diagnosis`) e registrado pelo medico
- Consultas podem ser presenciais ou remotas

### Fluxo
1. Medico agenda consulta
2. Paciente recebe notificacao
3. Durante a consulta, medico pode acessar relatorios
4. Medico registra diagnostico e observacoes
5. Consulta e finalizada e arquivada

## Comparacoes de Relatorios (report_comparisons)

### Regras
- Permite comparar multiplos relatorios
- Pode usar IA para gerar analises
- Identifica tendencias e padroes
- Util para consultas medicas

### Tipos de Comparacao
- **Temporal**: Comparar mesmo paciente em periodos diferentes
- **Dominial**: Comparar evolucao de um dominio especifico
- **Geral**: Visao ampla de multiplos periodos

## Permissoes e Acessos

### Paciente
- Ver seus proprios dados
- Responder questionarios
- Ver relatorios proprios
- Vincular/desvincular medicos

### Medico
- Ver dados de pacientes vinculados
- Criar/editar consultas
- Gerar comparacoes
- Exportar relatorios

### Administrador
- Acesso total ao sistema
- Gerenciar usuarios
- Configurar questionarios
- Ver metricas do sistema

## Validacoes de Negocio

### Questionario Diario
- Disponivel das 00:00 as 23:59 do dia
- Apenas uma resposta por dia
- Pode ser editado ate 24h apos resposta

### Questionario Semanal
- Disponivel no ultimo dia da semana (domingo)
- Considera dados da semana toda
- Bloqueado apos inicio da nova semana

### Questionario Mensal
- Disponivel nos ultimos 3 dias do mes
- Considera dados do mes todo
- Bloqueado apos dia 3 do mes seguinte

## Notificacoes

### Tipos
| Tipo | Trigger | Canal |
|------|---------|-------|
| Lembrete diario | Horario configurado | Push/Email |
| Streak em risco | 20h sem responder | Push |
| Nova consulta | Medico agenda | Email/Push |
| Relatorio pronto | Fim do periodo | Push |

## Integracao com IA

### Funcionalidades
- Geracao de resumos clinicos
- Analise de tendencias
- Sugestoes personalizadas
- Comparacao inteligente de periodos

### Limitacoes
- IA nao substitui diagnostico medico
- Paciente deve ser informado quando IA e usada
- Dados podem ser anonimizados para treinamento (com consentimento)

## Privacidade e LGPD

### Regras
- Dados de saude sao sensiveis (LGPD Art. 11)
- Consentimento explicito obrigatorio
- Direito a exclusao de dados
- Logs de acesso devem ser mantidos
- Dados criptografados em repouso e transito
