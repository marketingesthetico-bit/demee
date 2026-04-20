import "server-only";

import type { CalculatedBudget } from "@/lib/budget/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://demee.app";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function euro(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
}

function lineRows(budget: CalculatedBudget): string {
  return budget.lines
    .map(
      (line) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">
          <div style="font-weight:500;color:#2A2A28;">${esc(line.name)}</div>
          ${line.optionLabel ? `<div style="font-size:12px;color:#737373;">${esc(line.optionLabel)}</div>` : ""}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;color:#2A2A28;">
          ${euro(line.total)}
        </td>
      </tr>`,
    )
    .join("");
}

interface FreelancerNotificationArgs {
  freelancerName: string;
  freelancerHandle: string;
  guestName: string;
  guestEmail: string;
  guestCompany: string | null;
  guestMessage: string;
  budget: CalculatedBudget;
}

export function buildFreelancerNotificationEmail(args: FreelancerNotificationArgs): {
  subject: string;
  html: string;
} {
  const subject = `Nueva solicitud de presupuesto · ${args.guestName} · ${euro(args.budget.total)}`;
  const html = `
  <div style="font-family:'Inter',system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#2A2A28;background:#F7F4EC;">
    <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:24px;">
      <h1 style="font-family:'Fraunces',Georgia,serif;font-size:22px;margin:0 0 4px;">Nueva solicitud de presupuesto</h1>
      <p style="margin:0 0 20px;color:#737373;font-size:14px;">
        Te llegó desde <a href="${APP_URL}/${esc(args.freelancerHandle)}" style="color:#5B6B3C;">demee.app/${esc(args.freelancerHandle)}</a>
      </p>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.04em;color:#737373;margin:16px 0 8px;">Cliente</h2>
      <div style="background:#F7F4EC;border-radius:8px;padding:12px 14px;font-size:14px;line-height:1.6;">
        <div><strong>${esc(args.guestName)}</strong></div>
        <div><a href="mailto:${esc(args.guestEmail)}" style="color:#5B6B3C;">${esc(args.guestEmail)}</a></div>
        ${args.guestCompany ? `<div>${esc(args.guestCompany)}</div>` : ""}
      </div>

      ${args.guestMessage ? `
      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.04em;color:#737373;margin:16px 0 8px;">Mensaje</h2>
      <div style="background:#F7F4EC;border-radius:8px;padding:12px 14px;font-size:14px;line-height:1.6;white-space:pre-line;">${esc(args.guestMessage)}</div>
      ` : ""}

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.04em;color:#737373;margin:16px 0 8px;">Presupuesto</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${lineRows(args.budget)}
        <tr>
          <td style="padding:12px 0 0;font-weight:600;">Total</td>
          <td style="padding:12px 0 0;text-align:right;font-weight:600;">${euro(args.budget.total)}</td>
        </tr>
      </table>

      <div style="margin-top:24px;text-align:center;">
        <a href="${APP_URL}/dashboard/leads" style="display:inline-block;background:#2A2A28;color:#F7F4EC;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;">
          Ver en Demee
        </a>
      </div>
    </div>
    <p style="font-size:12px;color:#737373;text-align:center;margin:16px 0 0;">
      Demee · tu página en 5 minutos
    </p>
  </div>`;
  return { subject, html };
}

interface GuestConfirmationArgs {
  guestName: string;
  freelancerName: string;
  freelancerHandle: string;
  budget: CalculatedBudget;
}

export function buildGuestConfirmationEmail(args: GuestConfirmationArgs): {
  subject: string;
  html: string;
} {
  const subject = `Hemos recibido tu solicitud · ${args.freelancerName}`;
  const html = `
  <div style="font-family:'Inter',system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#2A2A28;background:#F7F4EC;">
    <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:24px;">
      <h1 style="font-family:'Fraunces',Georgia,serif;font-size:22px;margin:0 0 4px;">Gracias, ${esc(args.guestName)}</h1>
      <p style="margin:0 0 20px;color:#737373;font-size:14px;line-height:1.6;">
        Tu solicitud ha llegado a ${esc(args.freelancerName)}. Te responderá pronto directamente a tu email.
      </p>

      <h2 style="font-size:14px;text-transform:uppercase;letter-spacing:0.04em;color:#737373;margin:0 0 8px;">Resumen del presupuesto</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${lineRows(args.budget)}
        <tr>
          <td style="padding:12px 0 0;font-weight:600;">Total estimado</td>
          <td style="padding:12px 0 0;text-align:right;font-weight:600;">${euro(args.budget.total)}</td>
        </tr>
      </table>

      <p style="font-size:13px;color:#737373;margin:20px 0 0;line-height:1.6;">
        Esto es una estimación. El precio final puede variar según los detalles finales del proyecto.
      </p>
    </div>
    <p style="font-size:12px;color:#737373;text-align:center;margin:16px 0 0;">
      Enviado desde <a href="${APP_URL}/${esc(args.freelancerHandle)}" style="color:#5B6B3C;">demee.app/${esc(args.freelancerHandle)}</a>
    </p>
  </div>`;
  return { subject, html };
}
