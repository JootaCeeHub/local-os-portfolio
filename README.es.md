# Personal Hub

Un sistema operativo personal modular construido con React, TypeScript y Zustand para centralizar productividad, planificación y gestión personal en una sola interfaz.

## Overview
Personal Hub es una aplicación de dashboard enfocada en frontend que unifica múltiples dominios de gestión personal en un único espacio de trabajo: tareas, proyectos, finanzas, diario de trading, calendario, aprendizaje, sesiones Pomodoro, notificaciones, perfil y más. El proyecto usa una UI por módulos (navegación lateral + panel de trabajo) y cada dominio está respaldado por un store dedicado de Zustand persistido en localStorage.

La implementación actual prioriza:
- Gestión local-first y rápida de datos.
- Interacciones UI ricas (filtros, estados, vistas de analítica básica).
- Arquitectura extensible para agregar nuevos módulos e integraciones backend.

En resumen, este proyecto resuelve la fragmentación de usar múltiples apps separadas para cada flujo personal, concentrando los flujos clave en un hub unificado y personalizable.

## Features
- Workspace multi-módulo con navegación lateral.
- Dashboard con widgets de productividad y finanzas tipo KPI.
- Gestión de tareas:
  - Categorías, prioridades, estados, favoritos, archivado, filtros y ordenamiento.
- Gestión de proyectos:
  - Ciclo de vida, categorías, prioridad, presupuestos y seguimiento de progreso.
- Gestión financiera:
  - Transacciones, cuentas, presupuestos y actualización de balances por movimientos.
- Diario de trading:
  - Registro de operaciones, watchlist, estrategias y portafolio simulado.
- Calendario y eventos:
  - CRUD de eventos, categorías, vistas y recordatorios.
- Módulo Pomodoro:
  - Seguimiento de sesiones, estadísticas de racha y gamificación (árboles/monedas).
- Seguimiento de aprendizaje:
  - Cursos, objetivos, progreso y logros.
- Sistema de objetivos:
  - Goals, hitos, hábitos y métricas de avance.
- Sistema de logros:
  - Logros desbloqueables por categoría, puntos y progreso.
- Gestor de contenido:
  - Flujo draft/review/published/archived + analítica básica de engagement.
- Centro de notificaciones:
  - Notificaciones in-app con filtrado por estado/categoría + hooks de navegador.
- Perfil de usuario y ajustes globales:
  - Persistencia de tema/idioma/preferencias y metadatos de perfil.
- Capa de utilidades:
  - Validación de formularios (Zod), manejo de errores y analítica (GA4 + Mixpanel).

## Tech Stack
- **Framework frontend**: React 18
- **Lenguaje**: TypeScript
- **Build tool**: Vite 5
- **Gestión de estado**: Zustand + middleware persist
- **Estilos**: Tailwind CSS + tokens de diseño con variables CSS
- **Fechas**: date-fns
- **Iconografía**: lucide-react, Heroicons
- **UI/animación**: Headless UI, Framer Motion
- **Formularios y validación**: react-hook-form, zod, @hookform/resolvers
- **SDKs de analítica**: react-ga4, mixpanel-browser
- **Integraciones preparadas**: cliente Supabase, dependencias Stripe
- **Tooling de calidad**: ESLint, TypeScript strict mode, Vitest, Testing Library, Playwright (dependencias presentes)

## Architecture
La base del proyecto sigue una arquitectura modular de frontend:

1. **Capa de UI (`src/components`)**
   - Cada dominio está implementado como componente dedicado (Tasks, Finances, Projects, etc.).
   - `App.tsx` funciona como router de módulos renderizando el módulo activo seleccionado en el sidebar.

2. **Capa de estado (`src/store`)**
   - Un store de Zustand por dominio con acciones/selectores co-localizados.
   - La mayoría usa middleware `persist` con claves específicas de localStorage.

3. **Utilidades transversales (`src/hooks`, `src/utils`, `src/lib`)**
   - Hooks reutilizables para validación de formularios y manejo de errores.
   - Abstracciones de analítica y stubs de clientes externos.

4. **Capa de plataforma/configuración**
   - Vite + TypeScript + ESLint + Tailwind como pipeline de desarrollo y build.

### Notas de arquitectura
- Actualmente la app es **local-first** (almacenamiento en navegador), sin backend obligatorio.
- Existen entradas de menú en el sidebar que todavía no están conectadas en `App.tsx`, lo cual indica despliegue gradual de módulos.
- Hay dependencias instaladas (Supabase/Stripe/PWA/testing) con integración parcial, señal de expansión futura.

## Installation
### Requisitos previos
- Node.js 18+ (recomendado)
- npm 9+

### Pasos
```bash
# 1) Clonar repositorio
git clone <your-repository-url>
cd personal-hub-portfolio

# 2) Instalar dependencias
npm install

# 3) Levantar servidor de desarrollo
npm run dev
```

La app quedará disponible en la URL local de Vite (normalmente `http://localhost:5173`).

### Variables de entorno opcionales
Si quieres activar analítica e integraciones, crea un archivo `.env`:

```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_MIXPANEL_TOKEN=your_mixpanel_token
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Usage
1. Inicia la app con `npm run dev`.
2. Usa el sidebar izquierdo para cambiar entre módulos.
3. Crea y gestiona tus propios datos (tareas, proyectos, transacciones, objetivos, etc.).
4. Los datos se persisten automáticamente en localStorage del navegador.

### Build de producción
```bash
npm run build
npm run preview
```

## Project Structure
```text
personal-hub-portfolio/
├─ public/                    # Assets estáticos (ej. robots.txt)
├─ src/
│  ├─ components/             # Módulos UI principales + UI compartida + bloques marketing
│  ├─ store/                  # Stores Zustand por dominio (tasks, finance, goals, ...)
│  ├─ hooks/                  # Hooks de React reutilizables
│  ├─ utils/                  # Utilidades de analytics y helpers
│  ├─ lib/                    # Clientes externos (ej. Supabase)
│  ├─ types/                  # Interfaces TypeScript compartidas
│  ├─ App.tsx                 # Composición principal de módulos
│  ├─ main.tsx                # Punto de entrada React
│  └─ index.css               # Estilos globales y design tokens
├─ vite.config.ts             # Configuración Vite
├─ tailwind.config.js         # Extensiones de tema en Tailwind
├─ eslint.config.js           # Configuración ESLint
├─ tsconfig*.json             # Configuración TypeScript
└─ package.json               # Scripts y dependencias
```

## Development
### Scripts
```bash
npm run dev       # Servidor local
npm run build     # Build de producción
npm run preview   # Vista previa del build
npm run lint      # Lint del código
npm run analyze   # Análisis del bundle
```

### Flujo recomendado para contribuir
1. Crea una rama por feature.
2. Mantén módulos aislados (UI en `components`, estado en `store`).
3. Valida con lint/build antes de abrir PR.
4. Documenta cambios relevantes de arquitectura o módulos en este README.

## Roadmap
- Conectar todos los módulos del sidebar con pantallas/rutas funcionales.
- Introducir persistencia backend real (Supabase) y robustecer autenticación.
- Integrar proveedores de mercado reales para trading/watchlist.
- Añadir cobertura de pruebas (unitarias + integración + e2e) como gates de CI.
- Incorporar framework de i18n para UI bilingüe completa (es/en).
- Añadir sincronización de datos entre dispositivos.
- Integrar flujos de facturación con Stripe si evoluciona a SaaS.
- Activar capacidades PWA/offline-first (dependencia ya presente).

## License
Este software es personal y privado, creado y desarrollado por **JootaCee**.

## Author
Proyecto personal y privado creado y desarrollado por **JootaCee**.
