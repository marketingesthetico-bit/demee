# 04 · Roadmap MVP (6 semanas + lanzamiento)

Plan ejecutable semana a semana. Cada semana tiene **entregables verificables**.

---

## 📅 Semana 0 · Preparación (2-3 días antes de codear)

**Objetivo:** tener tracción validada antes de construir.

- [ ] Hacer entrevistas (o DMs estructurados) a **10 freelancers reales** usando `docs/09-validacion.md`.
- [ ] Publicar landing de waitlist en `demee.app` con:
  - Hero con la propuesta
  - 3 mockups visuales
  - Form de email
  - Compartir en r/freelance, Indie Hackers, Twitter, LinkedIn, r/SideProject
- [ ] Configurar entornos:
  - Proyecto Firebase (dev + prod)
  - Proyecto Vercel conectado al repo
  - Stripe en modo test
  - OpenAI API key
  - Resend con dominio verificado
  - PostHog
  - Sentry
- [ ] Crear repo con este scaffolding + CI básico (lint, type-check, test).

**Criterio de go/no-go:** 100+ emails en waitlist en 1 semana o señales claras en entrevistas.

---

## 🏗 Semana 1 · Fundamentos

**Objetivo:** auth + estructura de datos + página pública mínima.

### Lunes-Martes
- Scaffold Next.js 14 + TS + Tailwind + shadcn/ui.
- Firebase client + admin configurado.
- Layout marketing vs app.
- Tipos TS base (`Profile`, `User`, `Lead`).

### Miércoles-Jueves
- Sign-in/sign-up con Google OAuth + magic link.
- Middleware de auth para `(app)`.
- Creación de usuario + handle único (transacción).
- Página básica de onboarding (solo nombre + handle).

### Viernes
- Página pública `/[handle]` renderiza un perfil hardcoded.
- SEO metadata básica.
- Deploy a Vercel funcionando.

**Entregable:** puedo crear cuenta, elegir handle y ver una página pública en `demee.app/handle` con datos placeholder.

---

## 🎨 Semana 2 · Onboarding + estéticas

**Objetivo:** flujo completo de onboarding con IA.

### Lunes-Martes
- **Step 1 Industria**: grid con 8 industrias (las top para MVP). Cada industria con `config.json` que define secciones y campos.
- **Step 2 Estética**: 3 estéticas completas (minimal, bold, editorial). Cada una con tokens (fonts, colors, radii, spacing).
- ThemeProvider que aplica tokens al root.

### Miércoles-Jueves
- **Step 3 Importación IA**:
  - Endpoint `/api/ai/import-profile` con OpenAI.
  - Acepta: URL de web personal (scraping con Puppeteer en Function) o texto pegado.
  - Prompt de extracción (ver `docs/06-prompts-ia.md`).
  - Mapea a estructura de `Profile`.
- Fallback: form manual con nombre, titular, bio corta.

### Viernes
- **Step 4 Publicar**: preview + botón publicar.
- Render de la página pública con tokens de estética aplicados y secciones por industria.

**Entregable:** onboarding completo funcional. Desde registro hasta URL publicada en < 5 minutos.

---

## ✏️ Semana 3 · Editor

**Objetivo:** editor completo con live preview.

### Lunes-Martes
- Layout del dashboard con sidebar.
- Página "Mi página" con secciones como cards expandibles.
- Split screen: izquierda edición, derecha preview.
- Auto-save con debounce.

### Miércoles-Jueves
- Formularios para cada sección: Header, Sobre mí, Portfolio, Servicios, Testimonios, Contacto.
- Upload de imágenes a Firebase Storage con compresión.
- Cambio de estética desde dropdown con preview inmediato.
- Toggle ON/OFF por sección.

### Viernes
- Revalidation de la página pública al guardar.
- Mobile: vista en tabs (Edita / Previsualiza).

**Entregable:** el freelancer puede editar completamente su página y ver cambios en vivo.

---

## 💰 Semana 4 · Presupuestos

**Objetivo:** módulo de presupuestador end-to-end.

### Lunes-Martes
- Plantillas de presupuesto por industria (JSON config).
- Editor del presupuestador: CRUD de servicios, precios base, unidad.
- `BudgetConfig` en Firestore.

### Miércoles-Jueves
- `calculateBudget()` puro y testeado.
- Formulario público `/[handle]/budget`:
  - Visitante selecciona opciones.
  - Precio en vivo.
  - Datos de contacto finales.
  - Envío crea `Lead`.
- Email notificación al freelancer (Resend).
- Email confirmación al cliente.

### Viernes
- Vista de leads en dashboard con filtros (nuevo/visto/respondido).
- Click en lead muestra detalle.

**Entregable:** un visitante puede pedir presupuesto desde la página pública y el freelancer lo recibe y gestiona.

---

## 📅 Semana 5 · Agenda

**Objetivo:** agenda integrada funcional.

### Lunes-Martes
- OAuth flow con Google Calendar.
- Almacenamiento seguro de tokens.
- Página "Agenda" en dashboard: conectar calendar, crear tipos de reunión.
- Configuración de disponibilidad semanal.

### Miércoles-Jueves
- Página pública `/[handle]/book/[typeId]`:
  - Calendario de slots disponibles (cálculo server-side contra Google Calendar).
  - Selección de slot + datos del guest.
  - Creación de booking + evento en Google Calendar con Meet.
- Emails de confirmación (freelancer + guest) con `.ics`.

### Viernes
- Cron: recordatorio 24h antes.
- Cancelación desde email.
- Integración con presupuestador: tras enviar presupuesto, sugerir agendar.

**Entregable:** flujo completo de agenda. Los tres módulos funcionan y se comunican.

---

## 💳 Semana 6 · Monetización + pulido + landing

**Objetivo:** todo listo para lanzar.

### Lunes-Martes
- Stripe: productos Pro mensual y anual, checkout, portal.
- Webhook Stripe → actualizar plan.
- Gating de features Pro: dominio propio, sin marca, analytics avanzados, presupuestador avanzado, agenda múltiple.
- Página pricing.

### Miércoles-Jueves
- Custom domains: wizard + verificación DNS.
- Analytics básico con PostHog events.
- Página landing en `demee.app`:
  - Hero con demo interactiva.
  - Sección "Para tu industria" con mockups.
  - Pricing.
  - Testimonios (empiezan vacíos, se llenan con early users).
  - FAQ.
- Páginas SEO `/for/[industry]` (4 iniciales: diseñador, developer, coach, fotógrafo).

### Viernes
- QA completo del flujo end-to-end en todas las combinaciones críticas.
- Monitoreo con Sentry + PostHog.
- Plan de lanzamiento (ver semana 7).

**Entregable:** producto funcional, monetizable, listo para usuarios reales.

---

## 🚀 Semana 7 · Lanzamiento

### Pre-launch (lunes)
- Email a toda la waitlist con acceso anticipado (24h).
- Recoger feedback rápido, fix de bugs urgentes.

### Launch (miércoles)
- **Product Hunt**: preparado con gif demo, imágenes, primera semana.
- **Indie Hackers**: post "How I built X" con detalles reales.
- **Twitter/X**: thread de launch + demo en video.
- **LinkedIn**: post con ángulo B2B.
- **Reddit**: r/freelance, r/SideProject, r/EntrepreneurRideAlong, r/webdev, r/graphic_design.
- **Hacker News** (Show HN).
- **Hispanos**: forocoches off-topic (con cuidado), Hipertextual si tiene sentido, grupos de freelance españoles en Telegram/Discord.

### Post-launch (jueves-domingo)
- Responder a todos los comentarios y mensajes.
- Hotfix rápidos.
- Retomar waitlist con early users que reporten.
- Primeros casos de estudio reales para la web.

**KPI semana 7:** 1.000+ signups, 20+ conversiones a Pro, feedback accionable.

---

## 📈 Post-MVP (meses 2-6)

No es parte del MVP pero priorizado para después:

**Mes 2:**
- Más industrias (llegar a 15-20).
- Más estéticas (6 totales).
- Reuniones de pago con Stripe Connect.
- Integración Zapier para leads.

**Mes 3:**
- Detección de contexto de visitante (adaptar contenido según referrer).
- Analytics avanzados.
- Plan Studio para agencias pequeñas.
- i18n: inglés.

**Meses 4-6:**
- API pública.
- Plantillas premium diseñadas por creadores reconocidos (marketplace).
- Integraciones: Notion, Slack, Discord.
- Outlook Calendar.
- Branded emails en Pro.

---

## ✅ Definition of Done por semana

Cada semana cierra con:
- Tests pasando (unit + e2e críticos).
- Deploy en preview + verificado manualmente.
- Actualizar `docs/04-roadmap-mvp.md` marcando checkboxes.
- Demo interna grabada (Loom de 2-3 min) para tener registro de progreso.
