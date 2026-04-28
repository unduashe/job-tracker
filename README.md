# Job Tracker

Herramienta tipo Kanban para organizar candidaturas de empleo con foco en simplicidad, rapidez y seguimiento real durante la búsqueda de trabajo.

## Stack tecnológico

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Supabase (Auth + base de datos con RLS)
- Server Actions para operaciones de backend
- dnd-kit para drag and drop en el tablero

## Funcionalidades principales

- Registro, login y recuperación de contraseña
- Dashboard con columnas Kanban por estado de candidatura
- CRUD de candidaturas
- Notas asociadas a cada candidatura
- Cambio de estado mediante drag and drop

## Requisitos previos

- Node.js 20 o superior
- npm 10 o superior
- Proyecto de Supabase configurado

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con:

```bash
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_supabase_anon_publishable_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Notas:
- En producción, `NEXT_PUBLIC_SITE_URL` debe apuntar a tu dominio público real.
- Este valor se usa para generar enlaces de recuperación de contraseña de forma segura.

## Instalación

```bash
npm install
```

## Ejecución en local

```bash
npm run dev
```

La app quedará disponible en [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

```bash
npm run dev     # entorno de desarrollo
npm run build   # build de producción
npm run start   # arranque en modo producción
npm run lint    # revisión de lint
```

## Estructura del proyecto

```text
src/
  app/                    # Rutas (App Router) y Server Actions
  components/             # Componentes de UI y dashboard
  hooks/                  # Hooks de lógica de cliente
  lib/
    applications/         # Lógica de candidaturas y notas
    auth/                 # Utilidades de autenticación
    supabase/             # Clientes Supabase (server/client)
    utils/                # Utilidades compartidas
```

## Seguridad y autorización

- Autenticación gestionada por Supabase Auth
- El acceso a rutas protegidas se controla desde `src/proxy.ts`.
- Las operaciones de backend se ejecutan en Server Actions.
- La autorización por usuario se valida en la capa de acceso a datos en cada operación.
- Supabase con RLS es la capa final de protección a nivel de filas.

## Decisiones técnicas

- Uso de Server Actions para evitar exponer API pública innecesaria
- Validación de ownership en backend + RLS como capa final de seguridad
- Actualizaciones optimistas en drag and drop para mejorar UX

## Limitaciones actuales

- El orden dentro de cada columna no es personalizable (solo cambio de estado)
- Posibles condiciones de carrera en interacciones rápidas de drag and drop
- Revalidación completa del dashboard en lugar de invalidación granular

## Objetivo del proyecto

Este proyecto se ha desarrollado como aplicación real y como ejercicio de aprendizaje para:

- Profundizar en arquitecturas full-stack con Next.js App Router
- Trabajar con Supabase y políticas RLS
- Diseñar interfaces interactivas con drag and drop
- Aplicar buenas prácticas de UX en herramientas de uso diario