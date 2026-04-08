-- =========================================
-- TaskHigh — Schema SQL para Supabase
-- Execute no SQL Editor do seu projeto
-- =========================================

-- Habilitar UUID
create extension if not exists "pgcrypto";

-- TABELA: tasks
create table if not exists public.tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  status        text not null default 'pending'
                  check (status in ('pending','in_progress','done','cancelled')),
  priority      text not null default 'medium'
                  check (priority in ('low','medium','high')),
  due_date      date,
  created_by    uuid references auth.users(id) on delete cascade,
  assigned_to   uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz
);

-- TABELA: task_history
create table if not exists public.task_history (
  id            uuid primary key default gen_random_uuid(),
  task_id       uuid references public.tasks(id) on delete cascade,
  changed_by    uuid references auth.users(id) on delete set null,
  change_type   text not null default 'updated'
                  check (change_type in ('created','updated','status_changed','deleted')),
  notes         text,
  created_at    timestamptz not null default now()
);

-- TABELA: activity_logs (opcional, para logs gerais)
create table if not exists public.activity_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  action        text not null,
  resource_type text,
  resource_id   uuid,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);

-- =========================================
-- RLS (Row Level Security)
-- =========================================

alter table public.tasks enable row level security;
alter table public.task_history enable row level security;
alter table public.activity_logs enable row level security;

-- tasks: usuário vê/edita apenas suas tarefas
create policy "tasks_select" on public.tasks for select using (auth.uid() = created_by);
create policy "tasks_insert" on public.tasks for insert with check (auth.uid() = created_by);
create policy "tasks_update" on public.tasks for update using (auth.uid() = created_by);
create policy "tasks_delete" on public.tasks for delete using (auth.uid() = created_by);

-- task_history: usuário vê histórico das suas tarefas
create policy "history_select" on public.task_history for select
  using (exists (select 1 from public.tasks t where t.id = task_id and t.created_by = auth.uid()));
create policy "history_insert" on public.task_history for insert with check (auth.uid() = changed_by);
create policy "history_delete" on public.task_history for delete
  using (exists (select 1 from public.tasks t where t.id = task_id and t.created_by = auth.uid()));

-- activity_logs
create policy "logs_all" on public.activity_logs for all using (auth.uid() = user_id);

-- =========================================
-- Índices para performance
-- =========================================
create index if not exists idx_tasks_created_by on public.tasks(created_by);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_task_history_task_id on public.task_history(task_id);
create index if not exists idx_task_history_changed_by on public.task_history(changed_by);
