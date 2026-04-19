# 🚀 Cómo arrancar con Claude Code

Este documento explica paso a paso cómo usar los archivos de este repositorio con Claude Code en modo planificación.

---

## 1. Clona este scaffold en tu máquina

```bash
# Crea una carpeta nueva para el proyecto
mkdir demee && cd demee

# Copia aquí todos los archivos de este scaffold:
# README.md, CLAUDE.md, docs/*, HOW-TO-CLAUDE-CODE.md, .env.example

# Inicializa Git
git init
git add .
git commit -m "chore: initial project scaffold and docs"
```

---

## 2. Abre Claude Code en la carpeta

```bash
cd demee
claude
```

(O usa la integración con tu editor, VSCode, etc.)

---

## 3. El primer prompt que le das a Claude Code

Copia y pega esto **literal** en Claude Code:

```
Antes de nada, quiero que trabajemos en modo planificación.

Por favor:
1. Lee todo el archivo CLAUDE.md del repo.
2. Lee todos los archivos en /docs en orden (01 a 09).
3. Dame un resumen de máximo 15 líneas de qué entiendes que estamos construyendo y cuál es tu plan para la semana 1 del roadmap.
4. NO escribas código todavía. Solo el resumen y el plan.

Cuando te dé luz verde, arrancaremos con los primeros commits.
```

Claude Code te devolverá un plan. Léelo con atención. Si hay malentendidos, corrígelos antes de dejar que toque código.

---

## 4. Iteraciones siguientes

### Para cada nueva tarea grande (>2 archivos, lógica nueva):

```
Modo plan primero, por favor.

Tarea: [describir]

Antes de escribir código:
1. Lee los docs relevantes.
2. Propón: archivos a crear/modificar, dependencias, pasos, tests necesarios.
3. Espera mi OK antes de implementar.
```

### Para tareas pequeñas (bug fix, ajuste menor):

```
Arregla X en Y. Si afecta a más de 2 archivos, avísame antes.
```

### Si te quieres asegurar que no se desvía del stack / decisiones:

```
Antes de proponer nada, confirma qué dice CLAUDE.md y docs/03-arquitectura-tecnica.md sobre [tema].
```

---

## 5. Buenas prácticas con Claude Code para este proyecto

### Aprovecha skills

El scaffold ya menciona skills en `CLAUDE.md`. Cuando pidas algo que implique:
- Crear componentes frontend → Claude Code cargará `frontend-design` skill.
- Documentación → usará formato Markdown limpio.

### Usa feature flags para experimentación

Cuando construyas algo experimental:

```
Implementa X detrás de una feature flag de PostHog llamada `feature_x`. Default OFF.
```

### Protege main

```
Cada tarea en branch separada. Abre PR. No hagas push directo a main.
```

### Pide tests donde importa

```
Implementa X con tests unitarios en Vitest. Mínimo cubre: [casos borde].
```

### Revisa antes de merge

Claude Code no sustituye code review. Cada PR debe pasar por tu ojo antes de merge, especialmente en:
- Reglas de Firestore (seguridad).
- Webhooks de Stripe (dinero).
- Lógica de cálculo de presupuestos (core del producto).
- Cualquier `any` o `@ts-ignore`.

---

## 6. Comandos útiles durante el desarrollo

### Ejecutar localmente

```bash
# Frontend
npm run dev

# Firebase emulators (para desarrollo sin tocar producción)
npm run firebase:emulators

# Tests
npm run test         # unit
npm run test:e2e     # Playwright
```

### Deploys

```bash
# Vercel: push a main auto-deploya
git push origin main

# Firebase Functions
npm run deploy:functions

# Firestore rules
npm run deploy:rules
```

---

## 7. Si algo sale mal con Claude Code

### "Se desvió del plan"

```
Para. Revisa CLAUDE.md punto 'Principios de código' y docs/03-arquitectura-tecnica.md. Ajusta y dime qué cambia respecto a lo que íbamos a hacer.
```

### "No entiende algo del producto"

Vuelve a `docs/01-vision-producto.md` y `docs/02-especificacion-funcional.md`, identifica la sección que aclara lo que no entendió, y dile:

```
Lee la sección X del documento Y y replantéa tu propuesta con ese contexto.
```

### "Quiero cambiar algo estratégico"

Actualiza el doc correspondiente primero, haz commit, y luego:

```
docs/05-monetizacion.md ha cambiado. Revísalo y ajusta cualquier código o plan afectado.
```

---

## 8. Checklist antes de cada semana

Antes de empezar una nueva semana del roadmap:

- [ ] Revisar `docs/04-roadmap-mvp.md` y marcar completados de la semana anterior.
- [ ] Actualizar métricas en un doc temporal (`docs/metrics-weekly.md` o similar).
- [ ] Revisar errores en Sentry y decidir prioridades.
- [ ] Backlog de feedback de usuarios (cuando haya).
- [ ] Dar a Claude Code el contexto del roadmap actualizado.

---

## 9. Orden de tareas recomendado para la semana 0

Antes de tocar código:

1. **Lunes-Martes**: 5-7 entrevistas a freelancers (usar `docs/09-validacion.md`).
2. **Martes-Miércoles**: landing de waitlist publicada.
3. **Miércoles-Viernes**: otros 5 entrevistas + promoción de la waitlist en comunidades.
4. **Viernes**: decisión GO/PIVOT/NO-GO con los datos recopilados.
5. **Fin de semana**: si GO → setup de infra (Firebase, Vercel, Stripe test mode, Resend, dominio).
6. **Lunes semana 1**: arrancar con Claude Code.

---

## 10. Enlaces útiles

- [Claude Code docs](https://docs.claude.com/en/docs/claude-code)
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Firebase docs](https://firebase.google.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Stripe Billing](https://stripe.com/docs/billing)
- [PostHog](https://posthog.com/docs)

¡A por ello! 🚀
