# 01 · Visión del producto

## 🎯 El problema

Cualquier freelancer que empieza o que ya trabaja por cuenta propia necesita tres cosas para captar clientes:

1. **Una página** donde mostrar su trabajo y presentarse como profesional.
2. **Una forma de pedir presupuesto** que no sea "escríbeme por email".
3. **Una forma de agendar llamadas** sin ping-pong de correos.

Hoy resuelven esto con **3-4 herramientas inconexas**:

- Linktree o Carrd para la página.
- Google Form o Typeform para presupuestos.
- Calendly para la agenda.
- Notion o Canva para el portfolio.
- Gmail como pegamento entre todo.

El resultado: fricciones para el cliente potencial (saltos entre herramientas), datos desperdigados, y ninguna herramienta diseñada específicamente para el flujo del freelance.

## 💡 La solución: Demee

**Una sola URL (`demee.app/tunombre`) con los tres módulos integrados y hablando entre sí.**

Claves del producto:

1. **Onboarding de 60 segundos**: industria + estética + extracción IA desde LinkedIn/web/CV.
2. **Configurador por toggles**, no drag-and-drop. Menos intimidante, más rápido.
3. **Los módulos se comunican**: un presupuesto grande sugiere agendar llamada; una llamada agendada llega con el contexto del presupuesto.
4. **Plantillas industria-first**: un fotógrafo no necesita los mismos campos que un abogado.
5. **Freemium realmente usable**: no una demo limitada, un producto completo gratis.

## 🏆 Diferenciación (los 4 ángulos de victoria)

### 1. Industria-first, no plantilla-first

Competidores: "Elige una plantilla bonita y rellena los campos genéricos".
Demee: "¿A qué te dedicas? → generamos estructura, campos y ejemplos específicos para tu industria."

### 2. Tres módulos integrados, no tres herramientas pegadas

Competidores: portfolio OR presupuesto OR agenda. Nunca los tres bien.
Demee: los tres en una URL, con datos compartidos y flujos cruzados.

### 3. IA para eliminar los primeros 60 segundos de fricción

Competidores: empezar desde cero con un form vacío.
Demee: pega tu LinkedIn/web/CV, te damos un borrador completo editable.

### 4. Detección contextual del visitante (v1.1)

Si el visitante viene de LinkedIn → destaca perfil profesional y CTAs B2B.
Si viene de Instagram → destaca portfolio visual y CTA de contacto directo.
Si viene de GitHub → destaca stack técnico y disponibilidad.

## 📊 Mercado y competencia

### Tamaño del mercado

- **~1.600M freelancers globales** (estimación Upwork/WEF 2024).
- **~3,5M autónomos en España** (SEPE 2025).
- TAM accesible con productos digitales freemium: 50-100M freelancers con algún grado de presencia online.

### Competencia directa y cómo nos diferenciamos

| Producto | Fortaleza | Debilidad | Ventaja de Demee |
|----------|-----------|-----------|------------------|
| **Linktree** | Marca, simplicidad, 50M+ usuarios | Solo links, sin portfolio real, sin presupuestos | Producto completo, no solo links |
| **Carrd** | Económico, bonito, flexible | Requiere diseño, sin funcionalidades de freelance | Onboarding guiado, funcionalidad específica |
| **Copyfolio** | Bueno para copywriters | Solo nicho, sin presupuesto/agenda | Multi-industria + módulos integrados |
| **Contra** | Red social + perfil | Complicado, requiere compromiso | Ligero, no requiere entrar en ecosistema |
| **Bento** | Estético | Solo link-in-bio mejorado | Más funcional, mismo precio |
| **Calendly** | Dominante en agenda | Solo agenda | Integrado con presentación y presupuesto |
| **Notion sites** | Potente | Curva de aprendizaje, no diseñado para freelance | Específico, rápido |
| **Super.so / Framer** | Diseño pro | Para quien ya tiene diseño/copy | No requiere saber diseñar |

### Competencia indirecta

- Templates de Webflow/Framer/Notion.
- Plantillas de WordPress para freelancers.
- LinkedIn (como "portfolio" por defecto de mucha gente).

### Foso defensivo a construir

1. **Datos de conversión por industria**: saber qué funciona mejor en cada vertical y mejorar plantillas con esos datos.
2. **SEO masivo**: miles de páginas `demee.app/*` ranqueando por nombre personal de cada freelancer.
3. **Efecto de red débil**: cada URL en una bio de Instagram/Twitter/LinkedIn es marketing orgánico.
4. **IA entrenada en freelance real**: prompts afinados con feedback de uso.

## 🎨 Principios de diseño del producto

1. **Default bonito, edición sencilla.** El primer render debe ser presentable sin que el usuario toque nada.
2. **No pedir permiso.** No "¿quieres habilitar X?". Activar por defecto lo que tiene sentido en la industria elegida.
3. **Una decisión por pantalla.** Onboarding lineal, sin forks.
4. **Mostrar resultados, no opciones.** Previsualización en vivo siempre que se edita.
5. **Textos en primera persona.** "Mi página", "Mis presupuestos", no "Tu página" ni "Página del usuario".

## 🎯 Métricas norte

### Activación
- **Time to first published page** < 5 minutos.
- **% de usuarios que publican** tras crear cuenta > 70%.

### Retención
- **% usuarios activos semana 4** > 40%.
- **% que reciben ≥1 lead** en primeros 30 días > 30%.

### Monetización
- **Conversión free → Pro** 2-5%.
- **Churn mensual Pro** < 5%.
- **LTV/CAC** > 3 (CAC mayoritariamente orgánico por viralidad).

### Crecimiento
- **K-factor** (nuevos usuarios por usuario activo) > 0.3 para crecimiento viral sostenido.
- **Tráfico orgánico** a `demee.app/*` como principal canal de adquisición.

## 🚦 Hoja de ruta de alto nivel

- **Fase 1 — MVP (6 semanas)**: los tres módulos core, 6-8 industrias, 3-4 estéticas, Stripe, landing.
- **Fase 2 — Growth (meses 3-4)**: dominios propios, más industrias/estéticas, analytics, detección de visitante.
- **Fase 3 — Monetización avanzada (meses 5-6)**: reuniones de pago, Studio plan, API, white-label.
- **Fase 4 — Expansión (meses 6-12)**: internacionalización (EN, FR, IT, PT, DE), integraciones (Zapier, Notion, Slack), plantillas premium.
