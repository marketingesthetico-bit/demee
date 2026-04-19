# Demee

> Tu mini-web de freelance lista en 5 minutos — portfolio, presupuestos y agenda en una sola URL.

**Dominio:** [demee.app](https://demee.app)

## ¿Qué es Demee?

Demee es una plataforma para freelancers y profesionales independientes que unifica en una sola URL personal (`demee.app/tunombre`) los tres elementos que hoy resuelven con 3-4 herramientas distintas:

1. **Portfolio / página personal** — Mostrar trabajo y persona profesional.
2. **Presupuestador interactivo** — Que el visitante configure y reciba una estimación al instante.
3. **Agenda integrada** — Tipo Calendly, conectada a Google Calendar.

La diferencia clave frente a Linktree, Carrd, Contra o Copyfolio: **los tres módulos hablan entre sí** (un presupuesto puede derivar en agendar una llamada con el contexto ya cargado) y **la configuración es industria-first, no plantilla-first** (las preguntas y secciones se adaptan a si eres diseñador, developer, fotógrafo, coach, etc.).

## Propuesta de valor

- **Onboarding en 60 segundos**: elige industria + estética + pega tu LinkedIn/web → IA genera borrador completo.
- **Configurador por toggles**, no drag-and-drop intimidante.
- **Freemium generoso**: casi todo gratis; Pro a ~7 €/mes para quien quiera dominio propio, sin marca, módulos avanzados.

## Stack técnico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **IA**: GPT-4o-mini (extracción, generación de textos), Claude Sonnet opcional para textos largos
- **Pagos**: Stripe (suscripciones Pro + cobros de reuniones de pago)
- **Calendario**: Google Calendar API (Outlook en v2)
- **Analytics**: Plausible o PostHog

## Estructura del repositorio

```
demee/
├── README.md                    # Este archivo
├── CLAUDE.md                    # Instrucciones para Claude Code
├── docs/
│   ├── 01-vision-producto.md    # Visión, mercado, diferenciación
│   ├── 02-especificacion-funcional.md  # Features detalladas
│   ├── 03-arquitectura-tecnica.md      # Stack, estructura, data model
│   ├── 04-roadmap-mvp.md        # Plan semana a semana
│   ├── 05-monetizacion.md       # Pricing, conversión, unit economics
│   ├── 06-prompts-ia.md         # Prompts para los agentes IA
│   ├── 07-diseño-ux.md          # Guía visual, principios de diseño
│   ├── 08-seo-crecimiento.md    # Estrategia de growth y SEO
│   └── 09-validacion.md         # Preguntas para validar con freelancers
```

## Estado

🟡 **En planificación** — Listo para arrancar desarrollo con Claude Code.

## Siguiente paso

1. Validar con 10 freelancers reales (ver `docs/09-validacion.md`)
2. Desplegar landing de waitlist
3. Arrancar MVP (ver `docs/04-roadmap-mvp.md`)
