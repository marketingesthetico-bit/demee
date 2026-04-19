import type { Industry } from "@/types/profile";

import type { IndustryConfig } from "./types";

const CORE_SECTIONS = [
  "header",
  "about",
  "services",
  "portfolio",
  "testimonials",
  "contact",
] as const;

export const INDUSTRIES: Record<Extract<Industry, "graphic-designer" | "developer" | "ux-designer" | "photographer" | "copywriter" | "coach" | "marketing-consultant" | "architect">, IndustryConfig> = {
  "graphic-designer": {
    slug: "graphic-designer",
    label: "Diseñador gráfico",
    emoji: "🎨",
    tagline: "Identidad, branding y piezas visuales.",
    defaultSections: [...CORE_SECTIONS],
    examples: {
      headline: "Diseño de marca para proyectos que quieren parecer profesionales sin perder personalidad.",
      skills: ["Identidad visual", "Logotipos", "Tipografía", "Diseño editorial", "Packaging"],
      services: [
        { name: "Identidad de marca", description: "Logo, sistema visual, guía de uso. 2-3 semanas." },
        { name: "Diseño web (Figma)", description: "Landing o site multi-página listo para maquetar." },
        { name: "Pack redes sociales", description: "Plantillas y 10 piezas iniciales." },
      ],
    },
  },
  developer: {
    slug: "developer",
    label: "Developer",
    emoji: "💻",
    tagline: "Desarrollo web, apps y backend a medida.",
    defaultSections: ["header", "about", "services", "portfolio", "contact"],
    examples: {
      headline: "Construyo productos web end-to-end con Next.js, TypeScript y tooling moderno.",
      skills: ["TypeScript", "React / Next.js", "Node.js", "PostgreSQL", "AWS", "CI/CD"],
      services: [
        { name: "Landing de producto", description: "Diseño + dev + analytics. Entrega en 1-2 semanas." },
        { name: "App web a medida", description: "Stack moderno, tests, deploy. Sprints de 2 semanas." },
        { name: "Consultoría técnica", description: "Revisión de arquitectura y code review. Tarifa por hora." },
      ],
    },
  },
  "ux-designer": {
    slug: "ux-designer",
    label: "UX / UI Designer",
    emoji: "🖼",
    tagline: "Investigación, flujos y diseño de interfaz.",
    defaultSections: [...CORE_SECTIONS],
    examples: {
      headline: "Diseño producto digital desde la investigación hasta el handoff con desarrollo.",
      skills: ["Figma", "Investigación usuario", "Wireframing", "Design systems", "Prototipado"],
      services: [
        { name: "Auditoría UX", description: "Revisión de producto existente con plan de mejoras priorizadas." },
        { name: "Diseño de producto completo", description: "Research + flujos + UI. Proyectos de 4-8 semanas." },
        { name: "Design system", description: "Tokens, componentes y documentación en Figma." },
      ],
    },
  },
  photographer: {
    slug: "photographer",
    label: "Fotógrafa / fotógrafo",
    emoji: "📸",
    tagline: "Retrato, producto, evento, contenido de marca.",
    defaultSections: ["header", "about", "portfolio", "services", "testimonials", "contact"],
    examples: {
      headline: "Fotografía editorial para marcas que quieren imagen con carácter.",
      skills: ["Retrato", "Producto", "Evento", "Editorial", "Edición RAW", "Dirección artística"],
      services: [
        { name: "Sesión de retrato", description: "1-2 horas, 15-20 fotos retocadas. Entrega en 5 días." },
        { name: "Contenido para marcas", description: "Media jornada, 40 fotos seleccionadas." },
        { name: "Cobertura de evento", description: "Jornada completa, galería online privada." },
      ],
    },
  },
  copywriter: {
    slug: "copywriter",
    label: "Copywriter",
    emoji: "✍️",
    tagline: "Copy de marca, landing, email, SEO.",
    defaultSections: [...CORE_SECTIONS],
    examples: {
      headline: "Escribo textos que convierten sin sonar a vendedor de humo.",
      skills: ["Copy web", "Email marketing", "Landing", "Naming", "SEO", "Tono de marca"],
      services: [
        { name: "Copy de landing", description: "Briefing + 2 rondas de revisiones. Entrega en 1 semana." },
        { name: "Secuencia de email", description: "Welcome flow o campaña de lanzamiento." },
        { name: "Artículo SEO", description: "1500-2500 palabras con investigación de keywords." },
      ],
    },
  },
  coach: {
    slug: "coach",
    label: "Coach",
    emoji: "🧭",
    tagline: "Coaching personal, ejecutivo o de equipos.",
    defaultSections: ["header", "about", "services", "testimonials", "faq", "contact"],
    examples: {
      headline: "Acompaño a profesionales en transiciones de carrera y liderazgo con método y evidencia.",
      skills: ["Coaching ejecutivo", "Liderazgo", "Transición de carrera", "Equipos", "Facilitación"],
      services: [
        { name: "Sesión individual", description: "60 minutos online. Primera sesión de descubrimiento gratuita." },
        { name: "Programa 3 meses", description: "Sesiones quincenales con plan de desarrollo." },
        { name: "Facilitación de equipo", description: "Workshops de 2-4 horas sobre comunicación y visión." },
      ],
    },
  },
  "marketing-consultant": {
    slug: "marketing-consultant",
    label: "Consultor de marketing",
    emoji: "📈",
    tagline: "Estrategia, adquisición, performance.",
    defaultSections: [...CORE_SECTIONS],
    examples: {
      headline: "Diseño y ejecuto estrategias de adquisición para SaaS B2B con foco en ROI.",
      skills: ["Estrategia", "Paid ads", "SEO", "Content", "Analytics", "HubSpot"],
      services: [
        { name: "Auditoría de marketing", description: "Análisis completo de canales + roadmap priorizado." },
        { name: "Gestión mensual", description: "Ejecución, reportes y optimización continua." },
        { name: "Consultoría estratégica", description: "Sesiones con fundador, dirección de producto o CMO." },
      ],
    },
  },
  architect: {
    slug: "architect",
    label: "Arquitecta / arquitecto",
    emoji: "🏛",
    tagline: "Residencial, comercial, reformas y proyecto.",
    defaultSections: ["header", "about", "portfolio", "services", "testimonials", "contact"],
    examples: {
      headline: "Proyectos residenciales y reformas que equilibran luz, función y presupuesto.",
      skills: ["Proyecto básico", "Dirección de obra", "Reforma integral", "Interiorismo", "Licencias"],
      services: [
        { name: "Proyecto básico + ejecución", description: "Con memoria, planos y mediciones. Presupuesto cerrado." },
        { name: "Dirección de obra", description: "Visitas semanales y certificaciones." },
        { name: "Reforma integral", description: "Llave en mano: de diseño a entrega final." },
      ],
    },
  },
} as const;

export const INDUSTRY_LIST: IndustryConfig[] = Object.values(INDUSTRIES);

export function getIndustryConfig(slug: Industry): IndustryConfig | null {
  return (INDUSTRIES as Record<string, IndustryConfig | undefined>)[slug] ?? null;
}
