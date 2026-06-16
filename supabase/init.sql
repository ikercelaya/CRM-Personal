begin;

create table if not exists public.crm_clientes (
  id text primary key,
  nombre text not null,
  empresa text not null default '',
  tipo_negocio text not null default '',
  inicio date not null,
  implementacion integer not null default 0 check (implementacion >= 0),
  mantenimiento_mes integer not null default 0 check (mantenimiento_mes >= 0),
  created_at timestamptz not null default now(),
  constraint crm_clientes_id_not_empty check (length(trim(id)) > 0)
);

create table if not exists public.crm_proyectos (
  id text primary key,
  nombre text not null,
  cliente text not null default '',
  descripcion text not null default '',
  estado text not null check (
    estado in ('pendiente', 'en_progreso', 'pendiente_cliente', 'terminado')
  ),
  etiquetas text[] not null default '{}',
  created_at date not null default current_date,
  constraint crm_proyectos_id_not_empty check (length(trim(id)) > 0)
);

create table if not exists public.crm_tareas (
  id text primary key,
  titulo text not null,
  descripcion text not null default '',
  estado text not null check (estado in ('pendiente', 'en_progreso', 'completada')),
  prioridad text not null check (prioridad in ('alta', 'media', 'baja')),
  tipo text not null check (tipo in ('demo', 'reunion', 'otro')),
  fecha_limite date,
  hora text check (hora is null or hora ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  asignado_a text not null default '',
  created_at date not null default current_date,
  constraint crm_tareas_id_not_empty check (length(trim(id)) > 0)
);

create table if not exists public.crm_eventos (
  id text primary key,
  titulo text not null,
  descripcion text not null default '',
  tipo text not null check (tipo in ('demo', 'reunion', 'otro')),
  estado text not null check (estado in ('pendiente', 'en_progreso', 'completada')),
  fecha date not null,
  hora_inicio text not null check (hora_inicio ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  hora_fin text not null check (hora_fin ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  asignado_a text not null default '',
  created_at timestamptz not null default now(),
  constraint crm_eventos_id_not_empty check (length(trim(id)) > 0)
);

create index if not exists crm_clientes_created_at_idx
  on public.crm_clientes (created_at desc);

create index if not exists crm_proyectos_estado_idx
  on public.crm_proyectos (estado);

create index if not exists crm_tareas_estado_idx
  on public.crm_tareas (estado);

create index if not exists crm_tareas_fecha_limite_idx
  on public.crm_tareas (fecha_limite);

create index if not exists crm_eventos_fecha_idx
  on public.crm_eventos (fecha, hora_inicio);

alter table public.crm_clientes enable row level security;
alter table public.crm_proyectos enable row level security;
alter table public.crm_tareas enable row level security;
alter table public.crm_eventos enable row level security;

revoke all on table
  public.crm_clientes,
  public.crm_proyectos,
  public.crm_tareas,
  public.crm_eventos
from anon, authenticated;

grant select, insert, update, delete on table
  public.crm_clientes,
  public.crm_proyectos,
  public.crm_tareas,
  public.crm_eventos
to service_role;

commit;
