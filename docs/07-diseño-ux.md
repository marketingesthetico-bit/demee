# 07 · Diseño y UX

Guía visual y de experiencia. Cómo debe sentirse Demee.

---

## 🎭 Marca Demee

### Personalidad

- **Confiable pero no aburrido.** Demee es una herramienta profesional que no se avergüenza de tener personalidad.
- **Clara sobre compleja.** Si hay que elegir entre una función más o una pantalla más clara, gana la claridad.
- **Respetuosa con el tiempo del usuario.** Cada clic debe tener propósito.
- **Hispana de origen, internacional de ambición.** Copy en ES nativo (no traducido de EN), pero listo para escalar.

### Identidad visual de Demee (la plataforma, no las páginas públicas)

**Logo:** wordmark "demee" minúsculas + punto que pulsa sutilmente. Pendiente diseño final.

**Paleta Demee:**
- Primario: verde oliva intenso `#5B6B3C` — transmite confianza mediterránea sin ser corporativo.
- Acento: mostaza cálido `#D4A02F`.
- Neutros: papel crudo `#F7F4EC`, grafito `#2A2A28`.
- Estados: verde éxito `#3D8B56`, rojo error `#C8553D`.

Alternativa en discusión: un morado berenjena `#4C2D4F` con acento melocotón `#FFB59E` para diferenciarse del verde que usan muchos competidores (Linktree).

**Tipografía Demee:**
- Display: `Fraunces` (serif con carácter, gratis, variable).
- Body: `Geist` (sans moderna, excelente legibilidad).
- Mono (para código / código promocional): `JetBrains Mono`.

---

## 🎨 Sistema de estéticas para las páginas públicas

Cada estética define un theme completo: tokens de color, fuentes, radios, spacing, motion, tono.

### 1. Minimal

```
--font-display: "Söhne" | fallback "Inter"
--font-body: "Söhne" | fallback "Inter"
--color-bg: #FFFFFF
--color-fg: #0A0A0A
--color-muted: #737373
--color-accent: #0A0A0A
--radius-base: 2px
--spacing-unit: 1.2rem
--motion: restrained (200ms ease-out)
```
Tono: sobrio, sin adornos, espacios amplios, todo en blanco y negro.

### 2. Editorial

```
--font-display: "Fraunces"
--font-body: "Source Serif Pro"
--color-bg: #FBF8F3
--color-fg: #1A1A1A
--color-accent: #8B2E2A (rojo granate)
--radius-base: 0px
--spacing-unit: 1.5rem
```
Tono: revista, columnas, letras capitulares, ritmo pausado.

### 3. Bold

```
--font-display: "Archivo Black"
--font-body: "Archivo"
--color-bg: #0A0A0A
--color-fg: #FAFAFA
--color-accent: #FAFF00 (amarillo eléctrico)
--radius-base: 0px
```
Tono: contraste máximo, bloques de color, declaraciones grandes.

### 4. Playful

```
--font-display: "Gooper"
--font-body: "DM Sans"
--color-bg: #FFF5EA
--color-fg: #2D2A32
--color-accent: #FF6B9D (rosa)
--radius-base: 16px
--motion: bouncy (cubic-bezier(0.34, 1.56, 0.64, 1))
```
Tono: redondeado, warm, micro-animaciones alegres.

### 5. Corporate

```
--font-display: "Söhne"
--font-body: "Söhne"
--color-bg: #FFFFFF
--color-fg: #0F172A
--color-accent: #2563EB (azul)
--radius-base: 6px
```
Tono: grid ordenado, azul profesional, confiable.

### 6. Artistic

```
--font-display: "Migra"
--font-body: "Reckless"
--color-bg: #EDE6DD
--color-fg: #1C1817
--color-accent: #7C3AED (violeta)
--grain: subtle overlay
--motion: slow, ambient
```
Tono: asimétrico, grano de papel, tipografía expresiva.

### Variables CSS y switching

```css
:root {
  --color-bg: #FFF;
  --color-fg: #000;
  /* ... */
}

[data-aesthetic="bold"] {
  --color-bg: #0A0A0A;
  --color-fg: #FAFAFA;
  /* ... */
}
```

Un simple atributo `data-aesthetic` en el `<html>` de la página pública cambia todo. Sin rebuilds.

---

## 🧭 Principios UX

### 1. Defaults sensatos, edición cuando se quiera

Tras el onboarding, el usuario ya tiene una página decente sin tocar nada más. El editor es para refinar, no para empezar de cero.

### 2. Live preview siempre

Cualquier cambio se refleja inmediato en el preview. Cero "guardar y ver". El auto-save es silencioso (sin mensajes "guardando...").

### 3. Mobile es primero

La mitad de los visitantes de páginas personales vienen de redes sociales (Instagram, TikTok, Twitter) → mobile. Diseño mobile-first real, no "responsive después".

### 4. Progressive disclosure

Campos avanzados escondidos por defecto. "Más opciones" los revela. Evita abrumar.

### 5. Estado del sistema siempre visible

- Indicador de conexión con Google Calendar.
- Última vez guardado.
- Plan activo.
- Leads sin leer.

### 6. Error messages útiles

No "Error. Try again". Sí "No pudimos guardar tu bio. Revisa tu conexión o [reintentar]".

### 7. Copy en primera persona

- ✅ "Mi página" / "Mis presupuestos" / "Mi agenda"
- ❌ "Tu página" / "Página del usuario"

### 8. Sin gamificación vacía

No "¡Has completado el 75% de tu perfil!" con barritas que presionan. Sí sugerencias contextuales opcionales.

---

## 🖼 Componentes clave y su diseño

### Onboarding

- **Pantalla completa**, sin sidebar, sin header completo.
- Progress bar minimal arriba (4 pasos).
- Botón "Volver" siempre visible.
- Transiciones suaves entre pasos (slide horizontal + fade).

### Dashboard layout

```
┌──────────────────────────────────────────────┐
│ demee        [Mi página URL]    🔔  [avatar] │
├────────────┬─────────────────────────────────┤
│ ☰          │                                 │
│ 🏠 Inicio  │                                 │
│ ✏️ Mi página│          Content area          │
│ 💰 Presup. │                                 │
│ 📅 Agenda  │                                 │
│ 📊 Stats   │                                 │
│ ⚙️ Ajustes │                                 │
│            │                                 │
│ [Upgrade]  │                                 │
└────────────┴─────────────────────────────────┘
```

### Editor de "Mi página"

Split view en desktop:
- **Izquierda (40%)**: cards apilables de cada sección, con toggle y formularios.
- **Derecha (60%)**: iframe de la página pública con refresh automático.

En mobile:
- Tabs arriba: "Editar" / "Vista previa".
- Sticky bottom bar con "Publicar" / "Compartir".

### Página pública (visitante)

Layout determinado por la estética. Ejemplos:

**Minimal:**
```
      [Nombre grande, serif]
      titular en gris
      
      ──────── bio ────────
      
      [Servicios en línea horizontal]
      
      [Portfolio: grid 3 cols]
      
      ═══ Trabajamos juntos? ═══
      [Pedir presupuesto] [Agendar llamada]
      
      redes · email
```

**Editorial:**
```
  NOMBRE                           [foto lateral]
  apellido
  
  Titular en serif italic grande ──
  
  Columna 1          Columna 2
  Sobre mí           Sobre mí
  continúa...        continúa...
  
  ═══════════════════════════
  PORTFOLIO  —  2024
  ═══════════════════════════
  
  [proyecto 1]
  [proyecto 2]
  ...
```

### Modal de presupuesto

- Overlay con blur del fondo.
- Progreso lateral (1 de 4, 2 de 4, etc.).
- Precio actual en el footer persistente.
- Animación sutil al añadir/quitar servicios.

### Página de agenda pública

- Calendario a la izquierda, slots de tiempo a la derecha.
- Zona horaria del visitante detectada y mostrada.
- Confirmación en una sola pantalla (sin pasos extra).

---

## 🎬 Motion

### Principios

- **Con propósito**, no decorativo.
- **Rápido**: 200-300ms default. Máximo 500ms para transiciones de página.
- **Coherente con la estética**: minimal = menos motion, playful = más.

### Momentos clave

- **Aterrizaje en la landing**: hero con entrada escalonada (title → subtitle → CTAs → imagen).
- **Publicar por primera vez**: confetti sutil + mini-animación del link pulsando.
- **Recibir primer lead**: notificación con bounce + sonido opcional.
- **Transición entre pasos de onboarding**: slide + fade.
- **Guardar cambios**: punto verde discreto en la cabecera, no toast.

### Herramientas

- Framer Motion para animaciones JS.
- Tailwind `transition-*` para hovers y pequeñas.
- `@keyframes` CSS para animaciones ambientales (grano, pulsos).
- Respetar `prefers-reduced-motion` siempre.

---

## ♿ Accesibilidad

- Contraste WCAG AA mínimo (AAA en texto grande de hero).
- Navegación por teclado en todos los flujos.
- Focus visible siempre (ring de color primario).
- Todas las imágenes con alt (IA sugiere).
- Estados (loading, error, success) anunciados a screen readers.
- Formularios con labels asociados.
- Tests con axe-core en CI.

---

## 📱 Breakpoints

```
sm:  640px   — mobile grande
md:  768px   — tablet
lg:  1024px  — desktop pequeño
xl:  1280px  — desktop
2xl: 1536px  — grande
```

Diseñamos a **375px** (iPhone SE) y **1440px** (desktop estándar). Todo lo demás es interpolación.

---

## 📐 Grid y spacing

- **Container max-width**: 1200px en landing, 960px en páginas públicas (más legible), 1400px en dashboard.
- **Spacing scale**: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` (px). Tailwind default.
- **Sin medidas mágicas**. Siempre tokens.

---

## 🧪 Dark mode

- **Dashboard**: sí, con toggle manual + preferencia sistema.
- **Páginas públicas**: depende de la estética (Bold y Artistic son dark nativas; Minimal, Editorial, Playful, Corporate son light nativas — no forzar dark).

---

## 🖌 Iconografía

- **Lucide React** para todo UI.
- Tamaños estándar: 16, 20, 24, 32 px.
- Stroke width: 1.5 (sensación moderna).
- Nunca mezclar con otros sets (Heroicons, Phosphor, etc.) en el mismo producto.
