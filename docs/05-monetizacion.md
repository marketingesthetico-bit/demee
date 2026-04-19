# 05 · Monetización

## 🎯 Filosofía

**Freemium generoso, no freemium castrado.** Un usuario free debe tener producto suficiente para ser embajador. Pro se paga por features que el freelancer serio necesita, no por desbloquear lo básico.

## 💰 Planes

### Free — Siempre gratis

- ✅ URL `demee.app/tunombre`
- ✅ Editor completo con todas las secciones
- ✅ 1 estética activa + posibilidad de cambiar (no "bloqueadas")
- ✅ Presupuestador básico (sin condicionales complejos)
- ✅ Agenda con **1 tipo de reunión** activo
- ✅ Hasta **50 leads/mes** recibidos
- ✅ Google Calendar conectado
- ✅ Emails transaccionales
- ✅ Analytics básicos (visitas, fuentes, clicks)
- 🏷 Marca "Made with Demee" discreta en footer

### Pro — **7 €/mes o 59 €/año** (4,92 €/mes equivalente)

Todo lo de Free, más:
- ✅ **Dominio propio** (`tunombre.com`)
- ✅ **Sin marca Demee**
- ✅ Presupuestador avanzado: condicionales, descuentos, adjuntar archivos
- ✅ **Múltiples tipos de reunión** + reuniones de pago
- ✅ **Leads ilimitados**
- ✅ Analytics avanzados (funnel completo, heatmap, exportar CSV)
- ✅ Múltiples estéticas guardadas (cambiar según temporada/campaña)
- ✅ Favicon custom
- ✅ Integraciones: Zapier, webhooks, exportar a CRM
- ✅ Soporte prioritario (48h → 12h)

### Studio — **19 €/mes** (post-MVP, mes 3+)

Todo lo de Pro, más:
- ✅ Multi-perfil (hasta 5 miembros del equipo)
- ✅ Dominios custom ilimitados
- ✅ API pública
- ✅ White-label (agencias revendiendo)
- ✅ Branded emails (desde tu dominio)
- ✅ Onboarding guiado 1:1
- ✅ Soporte premium (chat en horario laboral)

## 📊 Por qué estos precios

**7 €/mes Pro:**
- Por debajo del umbral psicológico de "pensármelo" (10-15 €).
- Linktree Pro: $5/mes → competimos con mucho más valor.
- Calendly starter: $10/mes solo por agenda.
- Un freelancer que recibe 1 cliente al año gracias a la plataforma tiene ROI 10x+.

**59 €/año:**
- Descuento ~30% (equivalente a 4.92 €/mes).
- Mejora LTV y reduce churn.
- Compromiso que filtra usuarios serios.

**19 €/mes Studio:**
- Para pequeñas agencias (2-5 personas).
- Todavía barato frente a alternativas (Webflow, Framer, HubSpot).

## 🔥 Triggers de upgrade

Cosas que hacen que un Free piense "vale, toca pagar":

1. **Quiero mi dominio** → Pro (principal driver, 40-50% de conversiones esperadas).
2. **La marca Demee me resta profesionalidad** → Pro.
3. **Necesito varias reuniones distintas** (descubrimiento + consultoría + ejecución) → Pro.
4. **Quiero cobrar por mis llamadas** → Pro.
5. **Recibo muchos leads y quiero automatizar** (Zapier) → Pro.
6. **Me han llegado 50 leads, límite alcanzado** → Pro (límite debe ser suave: notificar, no bloquear de golpe).

## 📈 Proyecciones

### Supuestos conservadores

| Métrica | Valor |
|---------|-------|
| Conversión free → Pro | 3% |
| Churn mensual Pro | 4% |
| % anual vs mensual | 40% / 60% |
| CAC | 0 € (orgánico) primeros 6 meses |
| Precio efectivo medio Pro | 5.80 €/mes (mix mensual/anual) |
| Coste servidor por usuario activo | 0.10 €/mes |
| Coste IA por usuario (onboarding + uso normal) | 0.05-0.15 €/mes |

### Escenarios

**Mes 3:**
- 5.000 signups, 2.500 activos, 75 Pro
- MRR: 435 €
- Costes: ~250 €/mes
- **Neto: +185 €/mes**

**Mes 6:**
- 25.000 signups, 10.000 activos, 300 Pro
- MRR: 1.740 €
- Costes: ~700 €/mes
- **Neto: +1.040 €/mes**

**Mes 12:**
- 100.000 signups, 35.000 activos, 1.050 Pro
- MRR: 6.090 €
- Costes: ~2.000 €/mes
- **Neto: +4.090 €/mes** (~49k €/año)

**Mes 18-24:**
- 200.000+ signups, 60.000 activos, 1.800+ Pro, 50+ Studio
- MRR: 11.400 €+ (~137k €/año)
- Escalabilidad limitada solo por crecimiento, no por infra.

### Escenarios optimistas (si se viraliza tipo Linktree early days)
Multiplicar por 3-5x. Linktree llegó a 20M usuarios en ~3 años.

## 🎁 Estrategia de fricciones suaves (upgrade prompts)

No usar dark patterns, pero sí recordar valor:

- Al alcanzar 40/50 leads: banner "Te acercas al límite. Con Pro tienes leads ilimitados".
- Al intentar añadir 2º tipo de reunión: modal "Los múltiples tipos son Pro. ¿Upgrade? [también puedes seguir con Free]".
- Al intentar activar dominio propio: pricing + upgrade.
- Post-uso exitoso: "Tu página ha recibido 200 visitas. Quita la marca con Pro por 7€/mes".

## 💸 Mecánica de comisiones (reuniones de pago — Pro feature)

- El freelancer conecta Stripe Connect.
- El cliente paga la reunión al reservar.
- Demee transfiere al freelancer **100% del importe** (0% comisión para Pro).
- Demee paga las fees de Stripe (~1.5% + 0.25€), pero el freelancer puede optar a pagarlas él para quedarse con el neto completo (config).
- **Alternativa a considerar**: Free sí puede cobrar reuniones pero con 5% comisión Demee. Esto da monetización secundaria y suaviza la barrera a Pro. **Decisión pendiente**.

## 🎓 Descuentos y promociones

- **Early access**: primeros 500 Pro con 50% descuento de por vida. Dar este deal a la waitlist.
- **Estudiantes**: 50% si verifican email `.edu`.
- **Anual**: siempre 30% off.
- **Amigos referidos**: 1 mes Pro gratis por cada amigo que se registre y publique.

## 🚫 Lo que NO vamos a hacer

- ❌ Modelo de "págame por cada lead" (inconsistente con UX del freelancer).
- ❌ Anuncios en páginas free (mataría el uso profesional).
- ❌ Vender datos (nunca).
- ❌ Suscripción para visitantes.
- ❌ Trial de 7 días con tarjeta requerida (fricción alta; preferimos freemium real).

## 📝 Detalles operativos

- **Impuestos**: Stripe Tax activado desde día 1 (UE es compleja).
- **Facturas**: auto-emitidas por Stripe, accesibles desde Customer Portal.
- **Reembolsos**: primera vez sin preguntas (7 días).
- **Cancelación**: siempre posible, mantiene hasta final del periodo pagado.
- **Anti-fraude**: Stripe Radar + validación email + límites progresivos para nuevas cuentas.
