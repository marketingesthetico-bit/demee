export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const WEEKDAYS: readonly Weekday[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

/** Time window in the freelancer's local timezone, 24h format "HH:MM". */
export interface TimeWindow {
  start: string;
  end: string;
}

export type WeeklyAvailability = Record<Weekday, TimeWindow[]>;

export type LocationType = "online" | "phone" | "in-person";

export interface BookingConfig {
  enabled: boolean;
  /** Display name — "Llamada de descubrimiento". */
  name: string;
  description: string;
  /** 15, 30, 45, 60, 90. */
  durationMinutes: number;
  /** Rest between bookings, minutes. */
  bufferMinutes: number;
  /** Minimum hours between "now" and a slot start. Prevents same-minute bookings. */
  leadTimeHours: number;
  /** How far in advance visitors can book (days). */
  maxAdvanceDays: number;
  /** IANA tz id. MVP fixed to "Europe/Madrid". */
  timezone: string;
  availability: WeeklyAvailability;
  locationType: LocationType;
  /** e.g. "Te envío link de Meet al confirmar", "+34 6xx", address. */
  location: string;
  /** Intro shown at the top of /[handle]/book. */
  introText: string;
  updatedAt?: Date;
}

export interface AvailabilitySlot {
  /** ISO UTC. */
  startsAt: string;
  /** ISO UTC. */
  endsAt: string;
}

export interface BookingGuest {
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
}

export type BookingStatus = "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  ownerUid: string;
  handle: string;
  status: BookingStatus;
  guest: BookingGuest;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  locationType: LocationType;
  location: string;
  meetingName: string;
  timezone: string;
  createdAt: string;
}

export const DEFAULT_WEEKLY_AVAILABILITY: WeeklyAvailability = {
  monday: [{ start: "10:00", end: "14:00" }, { start: "15:00", end: "18:00" }],
  tuesday: [{ start: "10:00", end: "14:00" }, { start: "15:00", end: "18:00" }],
  wednesday: [{ start: "10:00", end: "14:00" }, { start: "15:00", end: "18:00" }],
  thursday: [{ start: "10:00", end: "14:00" }, { start: "15:00", end: "18:00" }],
  friday: [{ start: "10:00", end: "14:00" }],
  saturday: [],
  sunday: [],
};

export const DEFAULT_BOOKING_CONFIG: BookingConfig = {
  enabled: false,
  name: "Llamada de descubrimiento",
  description:
    "30 minutos online para entender qué necesitas y ver si puedo ayudar. Sin compromiso.",
  durationMinutes: 30,
  bufferMinutes: 10,
  leadTimeHours: 24,
  maxAdvanceDays: 30,
  timezone: "Europe/Madrid",
  availability: DEFAULT_WEEKLY_AVAILABILITY,
  locationType: "online",
  location: "Te envío link de Google Meet al confirmar.",
  introText: "",
};
