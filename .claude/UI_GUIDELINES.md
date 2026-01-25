# Diretrizes de UI/UX - Algia

## Filosofia de Design

O Algia adota um design **minimalista e acessivel**, focado em:

1. **Clareza**: Informacoes faceis de entender
2. **Simplicidade**: Interfaces limpas sem distracao
3. **Conforto**: Cores suaves, agradaveis aos olhos
4. **Acessibilidade**: Usavel por todos os usuarios

## Stack de UI

| Tecnologia | Proposito |
|------------|-----------|
| Tailwind CSS v4 | Estilizacao utility-first |
| shadcn/ui | Componentes base |
| Lucide React | Iconografia |
| CSS Variables | Tema e dark mode |

## Paleta de Cores

### Cores Semanticas

```
Background     - Fundo principal da aplicacao
Card           - Fundo de cards e containers
Primary        - Acoes principais, botoes
Secondary      - Acoes secundarias
Muted          - Elementos suaves, fundos alternativos
Accent         - Destaques, hover states
Destructive    - Erros, acoes de perigo
```

### Uso das Cores

```typescript
// Fundos
className="bg-background"     // Pagina
className="bg-card"           // Cards
className="bg-muted"          // Secoes alternativas
className="bg-primary"        // Botoes principais

// Textos
className="text-foreground"          // Texto principal
className="text-muted-foreground"    // Texto secundario
className="text-primary"             // Links, destaques

// Bordas
className="border-border"     // Bordas normais
className="border-input"      // Bordas de inputs
```

## Componentes Base

### Cards

Cards sao a unidade principal de organizacao visual.

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

// Card basico
<Card>
  <CardHeader>
    <CardTitle>Titulo do Card</CardTitle>
    <CardDescription>Descricao opcional</CardDescription>
  </CardHeader>
  <CardContent>
    Conteudo principal
  </CardContent>
  <CardFooter>
    Acoes do card
  </CardFooter>
</Card>

// Card com hover
<Card className="hover:shadow-lg transition-shadow cursor-pointer">
  ...
</Card>
```

### Botoes

Usar variantes apropriadas para cada contexto:

```typescript
import { Button } from '@/components/ui/button'

// Acao principal
<Button>Salvar</Button>

// Acao secundaria
<Button variant="secondary">Cancelar</Button>

// Acao destrutiva
<Button variant="destructive">Excluir</Button>

// Botao outline
<Button variant="outline">Editar</Button>

// Botao fantasma (menos enfase)
<Button variant="ghost">Ver mais</Button>

// Botao como link
<Button variant="link">Saiba mais</Button>
```

### Inputs

```typescript
import { Input } from '@/components/ui/input'

// Input basico
<Input placeholder="Digite aqui..." />

// Input com label
<div className="space-y-2">
  <label className="text-sm font-medium">Email</label>
  <Input type="email" placeholder="seu@email.com" />
</div>

// Input com erro
<div className="space-y-2">
  <Input className="border-destructive" />
  <p className="text-sm text-destructive">Email invalido</p>
</div>
```

### Dialogs/Modais

```typescript
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Titulo do Modal</DialogTitle>
      <DialogDescription>
        Descricao explicativa
      </DialogDescription>
    </DialogHeader>

    {/* Conteudo */}

    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Tabelas

```typescript
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Acoes</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Joao Silva</TableCell>
      <TableCell>Ativo</TableCell>
      <TableCell>
        <Button variant="ghost" size="sm">Editar</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Padroes de Layout

### Container Principal

```typescript
// Layout de pagina padrao
<main className="min-h-screen bg-background">
  <div className="container mx-auto px-4 py-8">
    {/* Conteudo */}
  </div>
</main>
```

### Grid de Cards

```typescript
// Grid responsivo de cards
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### Layout de Dashboard

```typescript
// Dashboard com sidebar
<div className="flex min-h-screen">
  {/* Sidebar */}
  <aside className="w-64 border-r bg-card hidden md:block">
    ...
  </aside>

  {/* Conteudo principal */}
  <main className="flex-1 p-6">
    ...
  </main>
</div>
```

### Stack Vertical

```typescript
// Elementos empilhados com espacamento
<div className="flex flex-col gap-4">
  <Card>...</Card>
  <Card>...</Card>
</div>

// Ou usando space-y
<div className="space-y-4">
  <Card>...</Card>
  <Card>...</Card>
</div>
```

## Formularios

### Estrutura de Formulario

```typescript
<form className="space-y-6">
  {/* Grupo de campo */}
  <div className="space-y-2">
    <label className="text-sm font-medium">Campo</label>
    <Input />
    <p className="text-sm text-muted-foreground">
      Texto de ajuda opcional
    </p>
  </div>

  {/* Grupo de campos inline */}
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <label className="text-sm font-medium">Nome</label>
      <Input />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-medium">Sobrenome</label>
      <Input />
    </div>
  </div>

  {/* Acoes */}
  <div className="flex justify-end gap-2">
    <Button variant="outline">Cancelar</Button>
    <Button type="submit">Salvar</Button>
  </div>
</form>
```

### Questionarios

Para questionarios do sistema, usar um layout especifico:

```typescript
// Card de pergunta
<Card className="p-6">
  <div className="space-y-4">
    {/* Numero e texto da pergunta */}
    <div className="flex gap-4">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
        1
      </span>
      <p className="text-lg">De 1 a 10, qual seu nivel de dor hoje?</p>
    </div>

    {/* Opcoes de resposta - escala */}
    <div className="flex justify-between gap-2 pt-4">
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <button
          key={n}
          className="h-10 w-10 rounded-full border hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          {n}
        </button>
      ))}
    </div>
  </div>
</Card>
```

## Feedback Visual

### Estados de Loading

```typescript
// Skeleton para cards
<Card className="animate-pulse">
  <CardHeader>
    <div className="h-4 w-3/4 bg-muted rounded" />
    <div className="h-3 w-1/2 bg-muted rounded" />
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="h-3 bg-muted rounded" />
      <div className="h-3 bg-muted rounded" />
      <div className="h-3 w-2/3 bg-muted rounded" />
    </div>
  </CardContent>
</Card>

// Spinner inline
<Button disabled>
  <span className="animate-spin mr-2">⟳</span>
  Carregando...
</Button>
```

### Estados de Erro

```typescript
// Card de erro
<Card className="border-destructive">
  <CardContent className="pt-6">
    <div className="flex items-center gap-2 text-destructive">
      <AlertCircle className="h-5 w-5" />
      <p>Erro ao carregar dados</p>
    </div>
  </CardContent>
</Card>

// Toast de erro (implementar com biblioteca)
```

### Estados Vazios

```typescript
// Quando nao ha dados
<Card>
  <CardContent className="py-12">
    <div className="text-center text-muted-foreground">
      <FileX className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>Nenhum registro encontrado</p>
      <Button variant="outline" className="mt-4">
        Criar primeiro registro
      </Button>
    </div>
  </CardContent>
</Card>
```

## Iconografia

Usar icones do **Lucide React**:

```typescript
import {
  User,
  Calendar,
  FileText,
  Activity,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Info
} from 'lucide-react'

// Uso
<Button>
  <Plus className="h-4 w-4 mr-2" />
  Adicionar
</Button>
```

### Tamanhos Padrao

| Contexto | Tamanho |
|----------|---------|
| Inline com texto | `h-4 w-4` |
| Botoes | `h-4 w-4` |
| Cards | `h-5 w-5` |
| Destaque | `h-6 w-6` |
| Hero/Empty state | `h-12 w-12` |

## Responsividade

### Breakpoints (Tailwind padrao)

| Prefixo | Largura minima |
|---------|----------------|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

### Mobile First

Sempre desenvolver mobile-first:

```typescript
// Mobile: 1 coluna, Desktop: 3 colunas
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

// Mobile: empilhado, Desktop: lado a lado
<div className="flex flex-col md:flex-row gap-4">

// Mobile: escondido, Desktop: visivel
<aside className="hidden md:block">
```

## Dark Mode

O sistema suporta dark mode via classe `.dark` no HTML.

### Testar Dark Mode

```typescript
// Cores que se adaptam automaticamente
className="bg-background"    // Claro ou escuro
className="text-foreground"  // Claro ou escuro

// Forcando cor especifica (evitar)
className="bg-white"         // Sempre branco
className="dark:bg-gray-900" // Sobrescrever no dark
```

## Acessibilidade

### Contraste

Garantir contraste adequado:
- Texto normal: minimo 4.5:1
- Texto grande: minimo 3:1

### Foco

Sempre manter indicadores de foco visiveis:

```typescript
// Tailwind ja inclui ring no focus
className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
```

### Labels

Sempre associar labels com inputs:

```typescript
<label htmlFor="email" className="text-sm font-medium">
  Email
</label>
<Input id="email" type="email" />
```

### Aria

Usar atributos aria quando necessario:

```typescript
<Button aria-label="Fechar modal">
  <X className="h-4 w-4" />
</Button>

<div role="alert" aria-live="polite">
  Mensagem de erro
</div>
```

## Animacoes

Usar animacoes sutis e funcionais:

```typescript
// Transicao de hover
className="transition-colors hover:bg-accent"

// Transicao de shadow
className="transition-shadow hover:shadow-lg"

// Fade in
className="animate-in fade-in"

// Slide in
className="animate-in slide-in-from-bottom"
```

## Evitar

1. **CSS customizado**: Preferir sempre Tailwind
2. **Cores hardcoded**: Usar variaveis semanticas
3. **Espacamento inconsistente**: Usar escala do Tailwind (4, 6, 8...)
4. **Componentes sem feedback**: Sempre ter hover/focus states
5. **Icones sem label**: Usar aria-label em botoes so com icone
6. **Excesso de animacoes**: Manter sutileza
