import "server-only";

export interface CreateEventInput {
  accessToken: string;
  calendarId?: string; // defaults to "primary"
  summary: string;
  description: string;
  startIso: string;
  endIso: string;
  timeZone: string;
  attendeeEmail: string;
  /** When true, adds a Google Meet conference link to the event. */
  withMeet: boolean;
  /** Stable id used as Meet's createRequest.requestId — keeps retries idempotent. */
  requestId: string;
}

export interface CreateEventResult {
  eventId: string;
  htmlLink: string | null;
  meetUrl: string | null;
}

export class CalendarApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`Calendar API ${status}: ${body.slice(0, 200)}`);
    this.name = "CalendarApiError";
  }
}

/**
 * Creates an event on the given calendar. When `withMeet` is true we
 * attach a Google Meet conference via conferenceData + request version 1
 * so Google returns the hangoutLink.
 */
export async function createCalendarEvent(
  input: CreateEventInput,
): Promise<CreateEventResult> {
  const calendarId = input.calendarId ?? "primary";
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
  );
  if (input.withMeet) url.searchParams.set("conferenceDataVersion", "1");
  url.searchParams.set("sendUpdates", "all");

  const body: Record<string, unknown> = {
    summary: input.summary,
    description: input.description,
    start: { dateTime: input.startIso, timeZone: input.timeZone },
    end: { dateTime: input.endIso, timeZone: input.timeZone },
    attendees: [{ email: input.attendeeEmail }],
    reminders: { useDefault: true },
    source: { title: "Demee", url: "https://demee.app" },
  };
  if (input.withMeet) {
    body.conferenceData = {
      createRequest: {
        requestId: input.requestId,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    };
  }

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new CalendarApiError(res.status, text);
  }
  const data = (await res.json()) as {
    id: string;
    htmlLink?: string;
    hangoutLink?: string;
    conferenceData?: {
      entryPoints?: { uri?: string; entryPointType?: string }[];
    };
  };
  const meetFromEntry = data.conferenceData?.entryPoints?.find(
    (e) => e.entryPointType === "video",
  )?.uri;
  return {
    eventId: data.id,
    htmlLink: data.htmlLink ?? null,
    meetUrl: data.hangoutLink ?? meetFromEntry ?? null,
  };
}

export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string,
  calendarId = "primary",
): Promise<void> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId,
  )}/events/${encodeURIComponent(eventId)}?sendUpdates=all`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  // 410 Gone = already deleted; treat as success.
  if (!res.ok && res.status !== 410 && res.status !== 404) {
    const text = await res.text().catch(() => "");
    throw new CalendarApiError(res.status, text);
  }
}
