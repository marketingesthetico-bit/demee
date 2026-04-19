# 03 · Arquitectura técnica

## 🏗 Stack completo

| Capa | Tecnología | Razón |
|------|-----------|-------|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR/ISR para SEO, Server Components, dominio del equipo |
| Styling | Tailwind CSS + shadcn/ui | Velocidad, consistencia, customizable |
| Auth | Firebase Auth | Google OAuth + magic links sin fricción |
| DB | Firestore | Real-time, escala automática, sin infra |
| Storage | Firebase Storage | Imágenes/archivos, CDN integrado |
| Functions | Firebase Functions (Node 20) | Webhooks Stripe, IA pesada, cron |
| IA | OpenAI GPT-4o-mini + Claude Sonnet | Mini para extracción/rutinas, Sonnet para textos de calidad |
| Pagos | Stripe | Suscripciones + Connect para pagos a freelancers |
| Email | Resend | Transaccional, DX simple, barato |
| Calendario | Google Calendar API | Integración estándar, Outlook en v2 |
| Hosting | Vercel | Next.js nativo, previews por PR |
| Analytics producto | PostHog | Funnels, retención, feature flags |
| Analytics web | Plausible | Privacy-friendly, simple |
| Error tracking | Sentry | Estándar |
| DNS / CDN | Cloudflare | Custom domains, performance |

## 📐 Decisiones arquitectónicas clave

### 1. App Router con Server Components por defecto

- Páginas públicas (`/[handle]`) son Server Components con ISR (`revalidate: 60`).
- Editor del freelancer mezcla Server (datos iniciales) + Client (interactividad).
- `"use client"` solo donde sea necesario.

### 2. Firestore como fuente de verdad

Sin ORM. Usamos Firestore client SDK en Client Components y Admin SDK en Server/API routes.

**Esquema principal:**

```
/users/{uid}
  - email, createdAt, displayName, photoURL
  - handle (único, indexado)
  - plan: "free" | "pro" | "studio"
  - stripeCustomerId
  - settings: {...}

/users/{uid}/profile (subcolección de 1 doc: "main")
  - industry, aesthetic
  - header: { name, headline, location, availability, photoURL }
  - about: { bio, skills[] }
  - services: [{ name, description, priceFrom, unit }]
  - portfolio: [{ title, description, imageURL, link, category }]
  - testimonials: [{ quote, author, role, company, photoURL }]
  - faq: [{ q, a }]
  - contact: { email, phone, social: { linkedin, twitter, instagram, github, behance, ... } }
  - theme: { ...overrides de estética }
  - published: boolean
  - publishedAt, updatedAt

/users/{uid}/budgets/{budgetConfigId}
  - Config del presupuestador
  - items: [{ id, name, description, basePrice, unit, options: [...] }]
  - modifiers: [{ condition, adjustment }]
  - finalFields: {...}
  - suggestBooking: boolean

/users/{uid}/meetings/{meetingTypeId}
  - Tipos de reunión
  - name, duration, buffer, price, availability, googleCalendarId

/leads/{leadId}
  - ownerUid (indexado)
  - type: "budget" | "meeting" | "contact"
  - status: "new" | "viewed" | "replied" | "closed"
  - payload: {...}  // contenido del lead
  - createdAt

/bookings/{bookingId}
  - ownerUid, meetingTypeId
  - guest: { name, email, notes }
  - startsAt, endsAt
  - googleEventId
  - status: "confirmed" | "cancelled" | "completed"
  - paymentStatus (si aplica)

/handles/{handle}
  - uid
  - createdAt
  // Colección para garantizar unicidad con transacción
```

**Reglas de Firestore** (esqueleto):

```js
match /users/{uid}/{document=**} {
  allow read: if true;  // lectura pública para /profile/main y subcolecciones públicas
  allow write: if request.auth.uid == uid;
}

match /leads/{leadId} {
  allow create: if validLeadPayload(request.resource.data);
  allow read, update: if request.auth.uid == resource.data.ownerUid;
  allow delete: if false;  // soft delete vía cloud function
}
```

**NOTA**: esto es esquema inicial. Requiere refinamiento en seguridad al construir — separar colecciones públicas/privadas si alguna info sensible acaba en `/profile`.

### 3. IA como servicio, no como dependencia

Wrapper en `src/lib/ai/` que abstrae provider (OpenAI/Anthropic):

```typescript
// src/lib/ai/index.ts
export async function extractProfile(source: string): Promise<ProfileDraft>
export async function suggestBio(context: Context): Promise<string>
export async function suggestAltText(imageURL: string): Promise<string>
export async function adaptToneForAesthetic(text: string, aesthetic: Aesthetic): Promise<string>
```

Prompts versionados en `docs/06-prompts-ia.md`. Cada función tiene timeout, retry y fallback a "vacío" si falla.

**Por qué GPT-4o-mini para casi todo**: coste ínfimo (~$0.15/1M input tokens), suficiente calidad para extracción y textos cortos. Claude Sonnet solo si el freelancer pide "ayúdame a escribir mi bio profesional" completa.

### 4. Renderizado de la página pública

Flujo:
1. Request llega a `/[handle]`.
2. Server Component fetch de `/handles/{handle}` → obtiene `uid`.
3. Fetch de `/users/{uid}/profile/main`.
4. Renderiza según `aesthetic` y `industry`:
   - Layout determinado por `aesthetic` (wrapper con fuente, colores, spacing).
   - Secciones determinadas por `industry` (qué mostrar y en qué orden).
5. ISR cachea 60s. Al editar desde dashboard, revalidation tag `profile:{handle}` invalida.

**Componentes por industria:**
```
src/components/public/industries/
  ├── developer/
  │   ├── StackSection.tsx
  │   ├── GitHubReposSection.tsx
  │   └── index.ts
  ├── photographer/
  │   ├── MasonryGallery.tsx
  │   └── index.ts
  └── ...
```

**Componentes por estética:**
```
src/components/public/aesthetics/
  ├── minimal/
  │   └── tokens.ts  // CSS vars, fonts
  ├── editorial/
  └── ...
```

Un `ThemeProvider` inyecta las CSS variables correspondientes en el root.

### 5. Presupuestador

Motor de cálculo puro, testeable:

```typescript
// src/lib/budget/calculate.ts
export function calculateBudget(
  config: BudgetConfig,
  selections: UserSelection[]
): BudgetResult {
  // suma base + aplica modificadores + devuelve breakdown
}
```

UI del visitante = formulario controlado que llama a `calculateBudget` en cada cambio para mostrar precio en vivo. Al enviar, server valida de nuevo y crea `/leads/{leadId}`.

### 6. Agenda

- OAuth flow con Google Calendar scope `calendar.events`.
- Almacenamos `refreshToken` cifrado en `/users/{uid}/integrations/google-calendar`.
- Al crear booking: cloud function crea evento en Calendar del freelancer con Google Meet link, envía `.ics` al guest.
- Cron diario: limpia bookings > 90 días, envía recordatorios 24h antes.

### 7. Pagos con Stripe

- **Suscripciones Demee (Pro/Studio)**: Stripe Billing clásico. Webhook en `/api/webhooks/stripe` que actualiza `plan` en `/users/{uid}`.
- **Reuniones de pago** (Pro feature): Stripe Connect Standard. Cada freelancer conecta su cuenta Stripe. Demee cobra la reunión y transfiere al freelancer (comisión 0% en Pro, quizá 2% en Free cuando se habilite — por definir).

### 8. Performance budget

- **Página pública**: LCP < 1.5s en 3G rápido, bundle JS client < 80KB gzip, imágenes AVIF/WebP.
- **Editor**: TTI < 3s, lazy load de secciones no visibles.
- **SEO**: lighthouse performance > 90 en páginas públicas.

---

## 🧱 Estructura de carpetas detallada

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                   # Landing
│   │   ├── pricing/page.tsx
│   │   ├── for/[industry]/page.tsx    # SEO: landing por industria
│   │   └── layout.tsx
│   │
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── edit/page.tsx
│   │   │   ├── budgets/page.tsx
│   │   │   ├── calendar/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── leads/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── onboarding/
│   │   │   ├── page.tsx              # Step 1: industry
│   │   │   ├── aesthetic/page.tsx
│   │   │   ├── import/page.tsx
│   │   │   └── publish/page.tsx
│   │   └── layout.tsx                # Auth guard
│   │
│   ├── [handle]/
│   │   ├── page.tsx                   # Página pública
│   │   ├── budget/page.tsx            # Formulario presupuesto
│   │   ├── book/[typeId]/page.tsx     # Agendar
│   │   └── layout.tsx
│   │
│   ├── api/
│   │   ├── ai/
│   │   │   ├── import-profile/route.ts
│   │   │   └── suggest-bio/route.ts
│   │   ├── webhooks/
│   │   │   ├── stripe/route.ts
│   │   │   └── google-calendar/route.ts
│   │   ├── leads/route.ts
│   │   ├── bookings/route.ts
│   │   └── handles/check/route.ts
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                    # shadcn/ui
│   ├── public/
│   │   ├── industries/
│   │   ├── aesthetics/
│   │   ├── sections/          # secciones comunes (Header, About, etc.)
│   │   └── ThemeProvider.tsx
│   ├── editor/
│   │   ├── Sidebar.tsx
│   │   ├── SectionCard.tsx
│   │   ├── LivePreview.tsx
│   │   └── forms/
│   ├── onboarding/
│   └── shared/
│
├── lib/
│   ├── firebase/
│   │   ├── client.ts
│   │   ├── admin.ts
│   │   └── converters.ts
│   ├── ai/
│   │   ├── index.ts
│   │   ├── extract-profile.ts
│   │   └── prompts/
│   ├── stripe/
│   │   ├── client.ts
│   │   └── subscriptions.ts
│   ├── budget/
│   │   └── calculate.ts
│   ├── calendar/
│   │   └── google.ts
│   ├── i18n/
│   └── utils.ts
│
├── types/
│   ├── profile.ts
│   ├── budget.ts
│   ├── lead.ts
│   └── index.ts
│
├── hooks/
│   ├── useProfile.ts
│   ├── useAuth.ts
│   └── useLivePreview.ts
│
└── styles/
    └── aesthetics/            # CSS vars por estética
```

---

## 🔐 Variables de entorno

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# OpenAI
OPENAI_API_KEY=

# Anthropic (opcional para v1)
ANTHROPIC_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=

# Google Calendar
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Resend
RESEND_API_KEY=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=

# App
NEXT_PUBLIC_APP_URL=https://demee.app
```

---

## 🧪 Testing

- **Unit**: Vitest. Foco en `lib/budget/calculate.ts`, `lib/ai/*`, utilidades.
- **Integration**: flujos críticos con Firebase emulator.
- **E2E**: Playwright. Mínimo: signup → onboarding → publicar → recibir lead.
- **Visual regression** (post-MVP): Chromatic o Percy en Storybook.

---

## 🚀 Pipeline de despliegue

1. Push a `main` → Vercel deploy a producción.
2. PR → preview URL automática.
3. Firebase Functions deploy via CLI en CI (GitHub Actions).
4. Migraciones de Firestore con scripts en `scripts/migrations/` (cuando aplique).

---

## ⚠️ Riesgos técnicos identificados

1. **Scraping de LinkedIn**: LinkedIn bloquea scraping. Alternativas: (a) usuario pega texto del perfil, (b) integración via OAuth con permisos (limitado), (c) solo soportar web propia + GitHub + CV. **Recomendación MVP**: opción (c) + pegar texto libre.

2. **Coste de IA si hay abuso**: límite estricto de llamadas por usuario (5 extracciones + 20 generaciones/mes en Free; 50/200 en Pro).

3. **Complejidad del editor por industria**: crecer sin volverse inmanejable. Solución: config-driven. Un JSON por industria define secciones y campos. Un solo componente editor las renderiza.

4. **Performance de Firestore en leads de alto tráfico**: un freelancer viral puede recibir picos. Rate limit + queue opcional con Cloud Tasks si se llega a ese punto.

5. **SEO de páginas públicas**: Google puede no indexar bien si ve contenido débil. Mitigación: IA genera al menos 200-300 palabras útiles. Schema.org bien puesto.
