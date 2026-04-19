# CLAUDE.md — Instrucciones para Claude Code

Este archivo configura cómo Claude Code debe trabajar en este proyecto. Léelo completo antes de cualquier tarea.

---

## 🎯 Contexto del proyecto

**Demee** es una plataforma para freelancers que combina portfolio + presupuestador + agenda en una sola URL personal (`demee.app/tunombre`).

**Público objetivo:** freelancers y profesionales independientes (diseñadores, developers, fotógrafos, copywriters, consultores, coaches, arquitectos, terapeutas, abogados independientes, etc.) que hoy usan 3-4 herramientas distintas para mostrar trabajo, enviar presupuestos y agendar reuniones.

**Modelo de negocio:** Freemium. Free muy generoso (incluye casi todo), Pro a ~7 €/mes para dominio propio, sin marca, módulos avanzados y leads ilimitados.

---

## 🧠 Modo de trabajo

### Modo Planning primero, código después

**Antes de escribir cualquier código**, Claude Code debe:

1. Leer toda la documentación en `docs/`.
2. Proponer un plan concreto con sub-tareas, archivos a crear/modificar, y dependencias.
3. Esperar aprobación antes de implementar.

Usa el flag `--plan` o inicia con "Necesito un plan para X antes de implementar" cuando la tarea sea no trivial (>2 archivos o lógica nueva).

### Principios de código

- **TypeScript estricto**: sin `any` salvo justificación explícita en comentario.
- **Server Components por defecto**: solo usa `"use client"` cuando haya interacción o hooks.
- **Firebase Admin SDK** en Server Components/API routes. Nunca expongas credenciales al cliente.
- **Componentes pequeños y enfocados**: si un archivo pasa de ~200 líneas, extrae.
- **Nombres en inglés** para código, **textos en español (ES)** para UI por defecto (i18n preparado desde día 1).

### Stack obligatorio

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui (no inventes otra librería de componentes)
- Firebase (Auth / Firestore / Storage / Functions)
- Stripe (suscripciones + pagos únicos)
- React Hook Form + Zod (validación de formularios)
- Framer Motion para animaciones no triviales
- Lucide React para iconos

### Qué NO hacer

- ❌ No propongas MongoDB, Supabase, Prisma, tRPC, o cambios de stack sin pedir antes.
- ❌ No instales librerías pesadas (Material UI, Chakra, Ant Design).
- ❌ No escribas CSS-in-JS (styled-components, emotion). Solo Tailwind.
- ❌ No uses Server Actions si un API route es más claro para el caso.
- ❌ No toques `firebase.rules` sin alertar — son críticos de seguridad.

---

## 📁 Estructura del proyecto (cuando exista código)

```
/
├── src/
│   ├── app/                      # App Router
│   │   ├── (marketing)/          # Landing, pricing, etc.
│   │   ├── (app)/                # Dashboard del freelancer (auth)
│   │   ├── [handle]/             # Página pública del freelancer
│   │   ├── api/                  # API routes
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn/ui
│   │   ├── public/               # Componentes de la página pública
│   │   ├── editor/               # Editor del freelancer
│   │   └── shared/
│   ├── lib/
│   │   ├── firebase/             # Client + Admin SDK
│   │   ├── ai/                   # Prompts y wrappers de IA
│   │   ├── stripe/
│   │   └── utils.ts
│   ├── types/                    # Tipos TS compartidos
│   └── hooks/
├── docs/                         # Documentación estratégica y funcional
├── public/
└── firebase/
    ├── firestore.rules
    └── functions/
```

---

## 🔐 Reglas de seguridad

- Secretos **solo** en `.env.local` (nunca commitear).
- Firestore rules restrictivas por defecto: un usuario solo puede escribir su propio documento.
- Validación server-side SIEMPRE, aunque haya validación client-side.
- Rate limiting en endpoints de IA y creación de leads.
- Sanitización de HTML si alguna vez se permite input rich-text.

---

## 🧪 Testing

- Vitest para unitarios.
- Playwright para E2E de flujos críticos (onboarding, recibir presupuesto, agendar).
- No obsesionarse con coverage en MVP. Priorizar tests en lógica de negocio (cálculo de presupuestos, reglas de planes).

---

## 🚀 Deploy

- Vercel para frontend (preview por PR).
- Firebase Functions para lógica que requiera entorno Node (webhooks Stripe, IA pesada).
- Dominio principal: `demee.app` en Vercel.
- Subdominio app opcional: `app.demee.app` o mantener todo en el mismo dominio con rutas separadas.

---

## 📝 Convenciones de commits

Convencional commits en inglés:
- `feat: add budget builder drag logic`
- `fix: calendar timezone mismatch`
- `refactor: extract theme token system`
- `docs: update MVP roadmap`

---

## 🗣 Comunicación con el dev (Erik)

- Responde en **español** salvo que te pida explícitamente inglés.
- Si una decisión tiene trade-offs, explícalos brevemente antes de elegir.
- Si detectas ambigüedad o falta de contexto, **pregunta antes de asumir**.
- Si encuentras bugs o deuda técnica en código existente, repórtalo aunque no sea el foco de la tarea.

---

## 📚 Documentos clave a consultar

1. `docs/01-vision-producto.md` — qué estamos construyendo y por qué
2. `docs/02-especificacion-funcional.md` — features detalladas
3. `docs/03-arquitectura-tecnica.md` — estructura de datos y decisiones técnicas
4. `docs/04-roadmap-mvp.md` — qué toca esta semana
5. `docs/06-prompts-ia.md` — prompts exactos para los agentes IA
