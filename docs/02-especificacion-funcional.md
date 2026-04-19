# 02 · Especificación funcional

Documento detallado de features y comportamientos esperados. Es la fuente de verdad sobre **qué** hace el producto.

---

## 👤 1. Autenticación y cuentas

### 1.1 Sign-up
- Google OAuth (primario).
- Email + magic link (secundario).
- Al crear cuenta: nombre, email, handle único (slug de `demee.app/handle`).
- Validación de handle: 3-30 chars, `a-z0-9-`, únicos, no reservados (`admin`, `app`, `api`, `www`, `blog`, etc.).

### 1.2 Sign-in
- Mismo que sign-up. Magic link cuando sin cuenta crea automáticamente.
- Sesión persistente con Firebase Auth.

### 1.3 Configuración de cuenta
- Cambiar handle (con redirect 301 desde el anterior durante 30 días).
- Email, foto de perfil, contraseña (si aplica).
- Borrar cuenta (soft delete 30 días, luego purge).

---

## 🚀 2. Onboarding

**Objetivo:** página publicada en < 5 minutos.

### Paso 1 · Industria
Grid visual con 24-30 industrias con icono + nombre. Buscador arriba.

**Industrias iniciales (MVP):**
1. Diseñador gráfico / visual
2. Desarrollador / ingeniero de software
3. Diseñador UX/UI
4. Fotógrafo
5. Videógrafo / editor de vídeo
6. Copywriter / redactor
7. Consultor de marketing
8. Consultor de negocio
9. Coach (life / business / ejecutivo)
10. Arquitecto
11. Ilustrador
12. Terapeuta / psicólogo
13. Nutricionista
14. Entrenador personal
15. Traductor
16. Abogado / asesor legal
17. Contable / asesor fiscal
18. Community manager
19. Social media manager
20. Productor musical
21. Profesor / formador
22. Virtual assistant
23. Data analyst
24. Otros (campo libre)

### Paso 2 · Estética
6 estilos visuales, cada uno mostrado con screenshot real:

1. **Minimal** — blanco, negro, serif elegante, mucho aire.
2. **Editorial** — tipografía grande, layout revista, acento de color.
3. **Bold** — contraste alto, sans bold, bloques de color.
4. **Playful** — pastel, bordes redondeados, iconos expresivos.
5. **Corporate** — azul profesional, grid ordenado, sans neutra.
6. **Artistic** — tipografía display, composición asimétrica, grano.

Cada estética define: fuente display, fuente body, paleta primaria/acento/neutros, radios, spacing, tono de micro-copy.

### Paso 3 · Importación IA (opcional pero destacado)

Input: "Pega tu LinkedIn, tu web actual, Behance, GitHub o sube tu CV".
- Acepta URL de LinkedIn, portfolio web, GitHub profile, PDF de CV.
- Claude Code llama a endpoint `/api/ai/import-profile` que:
  1. Scrapea (LinkedIn via proxy o el usuario debe pegar texto si es privado).
  2. Extrae con GPT-4o-mini: nombre, titular, bio, skills, experiencia, proyectos, enlaces.
  3. Mapea a la estructura de datos de Demee.
- Resultado: borrador pre-rellenado. El usuario ve y edita.

**Fallback:** si no quiere importar, formulario rápido manual (nombre, titular, bio corta, 3 skills).

### Paso 4 · ¡Publicar!
Preview de la página. Un botón "Publicar".
Tras publicar: modal con link + botones para compartir en X / LinkedIn / WhatsApp + "copia el link".

**Tras onboarding** el usuario llega al dashboard con tour de 4 pasos.

---

## 📄 3. Página pública (`demee.app/[handle]`)

### 3.1 Estructura base (aplicable a todas las industrias)

- **Header**: nombre + titular profesional + foto (opcional) + ubicación + estado (disponible / limitado / cerrado).
- **Sobre mí**: bio 2-4 párrafos + lista de skills/servicios.
- **Portfolio/trabajo**: grid de proyectos (imagen + título + descripción corta + link opcional). Diferente por industria (ver 3.2).
- **Servicios**: lista de servicios con descripción y precio "desde" (opcional).
- **Testimonios**: citas con nombre, rol, empresa, foto opcional.
- **CTA bloque central**: dos botones — "Pedir presupuesto" / "Agendar llamada".
- **Redes y contacto**: iconos hacia redes sociales, email, teléfono (opcional).
- **Footer**: "Made with Demee" (Free) o limpio (Pro).

### 3.2 Secciones específicas por industria

- **Desarrollador**: stack técnico (tags), repos destacados de GitHub (auto-sync), disponibilidad full-time/part-time/proyectos.
- **Fotógrafo**: grid masonry grande, categorías (retrato/evento/producto), pricing por tipo de sesión.
- **Coach**: programa(s) con descripción larga, "cómo trabajo", sesión gratuita de descubrimiento.
- **Consultor**: casos de estudio con problema/solución/resultado, logos de clientes.
- **Copywriter**: muestras escritas (texto formateado), industrias en las que trabaja.
- **Terapeuta/nutricionista**: enfoque terapéutico, certificaciones, idiomas, modalidad (online/presencial).
- **Arquitecto**: proyectos con plano + fotos + memoria, categorías (residencial/comercial).

### 3.3 Comportamiento

- SEO: metadata dinámica, Open Graph auto-generado con preview visual, schema.org `Person` + `ProfessionalService`.
- Performance: ISR con revalidación al editar, imágenes optimizadas (Next/Image + Firebase Storage + Cloudflare).
- Accesibilidad: contraste AA mínimo, navegación por teclado, alt text obligatorio en imágenes (IA sugiere alt).
- Responsive mobile-first.

---

## ⚙️ 4. Editor del freelancer (dashboard)

### 4.1 Estructura

Sidebar con secciones:
- 🏠 **Inicio** — resumen (leads recientes, próximas reuniones, visitas 7d).
- ✏️ **Mi página** — editor de la página pública.
- 💰 **Presupuestos** — configurador + leads recibidos.
- 📅 **Agenda** — tipos de reunión + reservas + conexión Google Calendar.
- 📊 **Analytics** — visitas, fuentes, conversión.
- ⚙️ **Ajustes** — cuenta, dominio, facturación.

### 4.2 Editor de Mi página

Formato **toggles + formularios**, no drag-and-drop.

Cada sección es una card expandible:
- Toggle ON/OFF para mostrar/ocultar la sección.
- Campos específicos según industria.
- Vista previa en vivo al lado (split screen en desktop; tab "Vista previa" en mobile).

Secciones editables:
1. Encabezado y foto.
2. Sobre mí.
3. Servicios / skills.
4. Portfolio / proyectos.
5. Testimonios.
6. Precios (opcional, off por defecto).
7. FAQ (opcional).
8. Contacto y redes.

**Cambio de estética:** dropdown "Cambiar estética" en la parte superior. Preview inmediato. Confirmar aplica.

### 4.3 Configurador de presupuesto

Presupuestos = formularios interactivos con lógica de precio.

**Plantillas por industria** (configurables):
- Diseñador: Logo / Branding / Web / Mantenimiento.
- Developer: Web app / Landing / Integración / Mantenimiento.
- Fotógrafo: Retrato / Evento / Producto / Contenido redes.
- Copywriter: Artículo / Web / Campaña email / SEO pack.
- ... (inicialmente cubrimos las 6-8 industrias top en MVP).

**Editor:**
- Lista de servicios base (añadir/quitar).
- Para cada servicio: nombre, descripción corta, precio base, unidad (proyecto / hora / mes).
- Modificadores (v1.5): "Si elige X, suma Y %", condicionales por combinaciones.
- Campos finales (siempre presentes, editables): datos del cliente (nombre, email, empresa, mensaje libre), adjuntar archivo.
- Checkbox final configurable: "Sugerir agendar llamada al enviar presupuesto".

**Flujo para el visitante:**
1. Click en "Pedir presupuesto".
2. Modal/página con selección de servicios y opciones.
3. Ve precio estimado en vivo mientras selecciona.
4. Añade datos y envía.
5. Confirmación + (si configurado) CTA "Agenda una llamada gratis de 15 min".

**Tras envío:**
- Lead en dashboard del freelancer.
- Email al freelancer con resumen.
- Email al cliente con confirmación + resumen.
- (Pro) Email/webhook/Zapier.

### 4.4 Agenda

- Conexión OAuth con Google Calendar.
- Crear "tipos de reunión": nombre, duración, buffer antes/después, disponibilidad semanal, enlace de videollamada (Google Meet auto / manual).
- **Free:** 1 tipo de reunión activo.
- **Pro:** múltiples tipos + reuniones de pago (Stripe Connect).
- Reservas desde `demee.app/[handle]` o `demee.app/[handle]/book/[type]`.
- Confirmación con `.ics`, recordatorio 24h antes.
- En dashboard: lista de próximas reuniones, cancelar/reprogramar.

### 4.5 Analytics

**Free (métricas básicas):**
- Visitas totales y por día (últimos 30 días).
- Fuente (directo / redes / referer).
- Clicks en CTAs.
- Leads recibidos.

**Pro (avanzado):**
- Funnel completo (visita → CTA → lead → reunión).
- Heatmap ligero.
- Exportar CSV.
- Segmentación por tipo de visitante (cuando se active contexto de visitante v1.1).

---

## 🌐 5. Dominios

### Free
- Subdominio `demee.app/[handle]`.

### Pro
- **Dominio propio** tipo `erikdesign.com` con wizard:
  1. Usuario introduce dominio.
  2. Demee muestra registros DNS a configurar (CNAME o A).
  3. Verificación automática. SSL auto (Vercel/Cloudflare).

---

## 💳 6. Planes y facturación

Ver `docs/05-monetizacion.md` para detalle completo. Resumen:

- **Free**: casi todo, con marca "Made with Demee" y límites suaves.
- **Pro** — 7 €/mes / 59 €/año: dominio propio, sin marca, features avanzadas, leads ilimitados.
- **Studio** — 19 €/mes (post-MVP): multi-perfil, API, white-label.

Gestión con Stripe Customer Portal embebido.

---

## 🔔 7. Notificaciones

- **Email transaccional**: Resend (simple, barato, bueno).
- **Tipos**: bienvenida, publicación, lead recibido, reunión agendada, reunión en 24h, confirmación de pago.
- **In-app**: campana en header del dashboard con leads y reuniones nuevas.

---

## 🌍 8. Internacionalización

- i18n desde día 1 con next-intl.
- **Idiomas MVP**: español.
- **Idiomas post-MVP (orden prioridad)**: inglés, portugués, francés, italiano, alemán.
- El idioma de la página pública lo elige el freelancer (no del visitante).

---

## 🚫 9. Límites y moderación (anti-abuso)

- **Rate limits**: 10 leads/hora por IP, 100 creaciones de cuenta/día por IP.
- **Filtro de contenido**: IA detecta contenido prohibido (adulto, escam, ilegal) en bios/portfolios.
- **Reporte**: botón discreto en footer de páginas públicas para reportar.
- **Handles reservados**: lista extensa (ver `src/lib/constants/reserved-handles.ts` cuando exista).

---

## ❓ 10. Decisiones abiertas (para revisar con Erik)

1. ¿Soportamos dominio propio también en Free con marca visible? (recomendación: no, es el principal driver de conversión a Pro).
2. ¿Cobramos comisión en reuniones de pago? (recomendación: 0% para Pro, diferenciador fuerte vs Calendly que cobra).
3. ¿Permitimos HTML custom / CSS custom en Pro? (recomendación: no en MVP, sí en Studio).
4. ¿Integración con WhatsApp Business para contacto directo? (sería un plus fuerte para España/LATAM).
