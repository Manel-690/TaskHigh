# TaskHigh 🚀

Plataforma de gerenciamento de tarefas moderna com visual SaaS — React + Vite + Tailwind CSS + Supabase.

## Stack

- **React 19** + **Vite** — build ultra-rápido
- **Tailwind CSS v4** — estilização utility-first
- **Supabase** — backend, autenticação e banco de dados
- **react-router-dom v7** — roteamento
- **react-hot-toast** — notificações

## Funcionalidades

- ✅ Login/logout com persistência de sessão
- ✅ Proteção de rotas
- ✅ Dashboard com KPIs e barra de progresso
- ✅ CRUD completo de tarefas (criar, listar, editar, excluir)
- ✅ Filtros por status, prioridade e busca textual
- ✅ Detalhe da tarefa com histórico de alterações
- ✅ Histórico global de atividades agrupado por data
- ✅ Dark mode / Light mode com persistência
- ✅ 3 cores de acento: Roxo, Azul, Verde
- ✅ Senha com mostrar/ocultar no login
- ✅ Mensagens de erro genéricas (sem expor detalhes técnicos)
- ✅ RLS (Row Level Security) no Supabase

## Configuração

### 1. Banco de dados

Execute o arquivo `supabase_schema.sql` no **SQL Editor** do seu projeto Supabase.

### 2. Variáveis de ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
```

⚠️ Use **apenas** a chave `anon` (pública). Nunca exponha a `service_role` no front-end.

### 3. Instalar e rodar

```bash
npm install
npm run dev
```

## Estrutura de pastas

```
src/
├── lib/
│   └── supabase.js          # Cliente Supabase
├── contexts/
│   ├── AuthContext.jsx       # Autenticação global
│   └── ThemeContext.jsx      # Dark mode + cor de acento
├── components/
│   ├── Sidebar.jsx           # Navegação lateral
│   ├── Badge.jsx             # StatusBadge + PriorityBadge
│   └── TaskModal.jsx         # Modal criar/editar tarefa
├── pages/
│   ├── Login.jsx             # Tela de login
│   ├── Dashboard.jsx         # Painel com KPIs
│   ├── Tasks.jsx             # Lista de tarefas com filtros
│   ├── TaskDetail.jsx        # Detalhe + histórico da tarefa
│   ├── History.jsx           # Histórico global
│   └── Profile.jsx           # Perfil e preferências
├── App.jsx                   # Rotas protegidas
├── main.jsx
└── index.css                 # Variáveis de tema CSS
```

## Tabelas Supabase utilizadas

| Tabela | Descrição |
|--------|-----------|
| `tasks` | Tarefas com título, descrição, status, prioridade, prazo |
| `task_history` | Histórico de alterações por tarefa |
| `activity_logs` | Log geral de atividades (estrutura disponível) |

