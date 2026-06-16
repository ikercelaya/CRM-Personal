# CRM-Personal
Plataforma de gestión personal

# Iker · CRM Personal

CRM personal para organizar tu día a día desarrollando proyectos de software con IA:
**clientes, proyectos (kanban), tareas (kanban) y calendario semanal**, con una página
de inicio que te saluda según la hora.

Construido con **Next.js 15 (App Router) + TypeScript + Tailwind CSS** y pensado para
desplegarse en **Vercel** en un par de clics. No necesita base de datos.

---

## 📑 Índice

- [Cómo funciona la plataforma](#-cómo-funciona-la-plataforma)
- [Acceso (usuario y contraseña)](#-acceso-usuario-y-contraseña)
- [Dónde se guardan los datos](#-dónde-se-guardan-los-datos)
- [Arrancar en local](#-arrancar-en-local)
- [Desplegar en Vercel](#-desplegar-en-vercel)
- [Personalización](#-personalización)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Stack técnico](#-stack-técnico)
- [Preguntas frecuentes](#-preguntas-frecuentes)

---

## 🧭 Cómo funciona la plataforma

La app tiene un **menú lateral** fijo con 5 secciones. Todas las pantallas son
privadas: si no has iniciado sesión, te redirige al login automáticamente.

### 1. Dashboard (inicio)
- Muestra un **saludo según la hora** del dispositivo: *"Buenos días / Buenas tardes /
  Buenas noches, Iker."*
  - `06:00–13:59` → Buenos días · `14:00–20:59` → Buenas tardes · resto → Buenas noches
- **Tarjetas-resumen**: nº de Clientes, Proyectos activos (no terminados), Tareas
  pendientes y Tareas vencidas.
- **Próximas tareas**: lista las tareas sin completar que vencen en los próximos 7 días
  (o que ya están vencidas, marcadas en rojo). Si no hay nada, muestra *"Nada urgente
  esta semana."*.

### 2. Clientes
- **Tabla** con: Nombre, Empresa, Tipo de negocio, Inicio, Implementación, Mant./mes y
  **Total anual** (se calcula solo: `implementación + mantenimiento × 12`).
- **Buscador** por nombre o empresa.
- Botón **“Nuevo Cliente”** para crear, e iconos de **editar/eliminar** al pasar el ratón
  sobre cada fila.

### 3. Proyectos (tablero kanban)
- Cuatro columnas de estado: **Pendiente · En Progreso · Pendiente Cliente · Terminado**.
- Crea proyectos con **“Nuevo Proyecto”** (nombre, cliente, descripción, estado y etiquetas
  como *Demo* o *Propuesta*).
- **Arrastra las tarjetas con el ratón** de una columna a otra para cambiar su estado.
- **Clic en una tarjeta** para editarla; icono de papelera para borrarla.
- Buscador por nombre, cliente o descripción.

### 4. Tareas (tablero kanban)
- Tres columnas: **Pendiente · En Progreso · Completada**.
- **Filtros** por prioridad (Alta/Media/Baja) y por tipo (Demo / 1ª Reunión / Otro) +
  buscador.
- Cada tarjeta muestra prioridad (color del borde izquierdo), tipo, fecha límite (en rojo
  si está **vencida**) y a quién está asignada.
- **Arrastrar y soltar** entre columnas, **clic en el círculo** para marcar como completada,
  clic en la tarjeta para editar y papelera para borrar.
- En la cabecera se indica cuántas tareas hay **vencidas**.

### 5. Calendario (vista semanal)
- Rejilla de lunes a domingo con franjas horarias; el día de hoy aparece resaltado.
- Navega con **“Hoy”** y las flechas **‹ ›** entre semanas.
- Crea eventos con **“Nuevo Evento”** o **haciendo clic en una franja horaria**.
- **Arrastra un evento** a otro día/hora para reprogramarlo.
- Cada evento tiene **tipo** (color: Demo morado, 1ª Reunión azul, Otro gris) y **estado**
  (Pendiente / En progreso / Completada); el estado se refleja visualmente (los completados
  aparecen tachados y atenuados).

---

## 🔐 Acceso (usuario y contraseña)

El acceso se controla con variables de entorno. Por defecto (desarrollo):

- **Usuario:** `iker`
- **Contraseña:** `iker2026`

La sesión se guarda en una **cookie firmada (JWT)** y un *middleware* protege todas las
rutas privadas. Cambia las credenciales antes de desplegar (ver Vercel).

---

## 🗄️ Dónde se guardan los datos

Para mantenerlo simple, **no hay base de datos**: clientes, proyectos, tareas y eventos se
guardan en el **navegador** (`localStorage`, clave `crm_personal_data_v1`). La app arranca
con datos de ejemplo que puedes editar o borrar.

> ✅ Perfecto para uso personal en un mismo equipo.
> ⚠️ Los datos no se sincronizan entre dispositivos (viven en ese navegador). Si quieres
> usarlo desde el móvil y el ordenador con los mismos datos, se puede conectar a **Supabase**
> sustituyendo solo la capa de datos (`lib/store.tsx`), sin tocar las pantallas.

---

## 🚀 Arrancar en local

```bash
npm install
cp .env.example .env.local   # edita tus credenciales
npm run dev
```

Abre **http://localhost:3000** (te llevará al login).

---

## ▲ Desplegar en Vercel

1. Sube el proyecto a GitHub (repo `ikercelaya/CRM-Personal`).
2. En [vercel.com](https://vercel.com) → **Add New → Project** → importa el repo.
3. Framework: **Next.js** (se detecta solo). No hay que tocar el build.
4. En **Environment Variables** añade:

   | Nombre         | Valor                                                  |
   | -------------- | ------------------------------------------------------ |
   | `CRM_USER`     | tu usuario                                             |
   | `CRM_PASSWORD` | tu contraseña                                          |
   | `AUTH_SECRET`  | una cadena larga aleatoria (`openssl rand -base64 32`) |

5. **Deploy**. ¡Listo!

---

## 🎨 Personalización

- **Nombre de la app, tu nombre y rol** → `lib/config.ts`
- **Color de acento y tema** → `tailwind.config.ts` (`accent`) y `app/globals.css`
- **Datos de ejemplo iniciales** → `lib/seed.ts`
- Para empezar de cero: borra los datos del navegador (DevTools → Application →
  Local Storage → elimina `crm_personal_data_v1`).

---

## 🧱 Estructura del proyecto

```
app/
  (app)/            → zona privada (con menú lateral)
    dashboard/      → inicio + saludo por hora
    clientes/       → tabla de clientes
    proyectos/      → kanban de proyectos
    tareas/         → kanban de tareas
    calendario/     → calendario semanal
  login/            → pantalla de acceso
  api/auth/         → login / logout
components/         → Sidebar, Modal, Logo
lib/                → tipos, store (localStorage), auth, utilidades, config
middleware.ts       → protege las rutas privadas
```

---

## 🛠️ Stack técnico

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** para el diseño
- **jose** (JWT) para la sesión · **lucide-react** (iconos) · **date-fns** (calendario)
- Persistencia en **localStorage** (sin BBDD)

---

## ❓ Preguntas frecuentes

**¿Pierdo los datos si cierro sesión?**
No. Cerrar sesión solo borra la cookie de acceso; los datos siguen en el navegador.

**¿Puedo usarlo en el móvil?**
Sí, es responsive. Pero al guardarse en `localStorage`, cada dispositivo tiene sus propios
datos. Para datos compartidos, usa Supabase.

**¿Cómo cambio el nombre “Propulsa”?**
Edita `APP_NAME` en `lib/config.ts`.

**¿Es seguro?**
El acceso va por usuario/contraseña con cookie firmada. Usa un `AUTH_SECRET` largo y
credenciales propias en producción.