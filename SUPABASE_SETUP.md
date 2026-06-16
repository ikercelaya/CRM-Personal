# Integracion con Supabase

Esta version mantiene el login actual del CRM y usa Supabase como base de datos
remota. La clave secreta se usa solo en rutas API de Next.js, nunca en el
navegador.

## 1. Crear el proyecto

1. Entra en https://supabase.com/dashboard.
2. Crea un proyecto nuevo.
3. Espera a que la base de datos termine de inicializarse.

## 2. Crear las tablas

1. Abre el proyecto en Supabase.
2. Ve a SQL Editor.
3. Copia y ejecuta el contenido de `supabase/init.sql`.

Ese SQL crea:

- `crm_clientes`
- `crm_proyectos`
- `crm_tareas`
- `crm_eventos`

Todas las tablas tienen RLS activado y no dan acceso directo a `anon` ni
`authenticated`; la app escribe desde el servidor con la secret key.

## 3. Configurar variables locales

Crea `.env.local` con:

```bash
CRM_USER=iker
CRM_PASSWORD=iker2026
AUTH_SECRET=pon-aqui-un-secreto-largo
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Puedes usar tambien la clave legacy `service_role` en
`SUPABASE_SERVICE_ROLE_KEY`, pero Supabase recomienda las nuevas secret keys.

## 4. Probar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`, inicia sesion y crea un cliente de prueba. Luego
comprueba en Supabase > Table Editor que aparece en `crm_clientes`.

## 5. Desplegar en Vercel

En Vercel, anade estas variables de entorno al proyecto:

- `CRM_USER`
- `CRM_PASSWORD`
- `AUTH_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

Despues haz deploy. Al entrar desde cualquier dispositivo con el mismo usuario y
contrasena, todos leeran y escribiran en la misma base de datos.
