export interface CustomEventRecord {
  id: string;
  name: string;
  content: string | null;
  event_date: string;
  location: string | null;
  created_by?: string | null;
}

interface PersonEventSource {
  id: string;
  full_name: string;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  death_year: number | null;
  death_month: number | null;
  death_day: number | null;
  death_lunar_year: number | null;
  death_lunar_month: number | null;
  death_lunar_day: number | null;
  is_deceased: boolean;
}

export interface FamilyEvent {
  id: string;
  type: "birthday" | "death_anniversary" | "custom_event";
  personId?: string;
  personName: string;
  eventDateLabel: string;
  daysUntil: number;
  originYear?: number | null;
  originDay?: number | null;
  originMonth?: number | null;
  location?: string | null;
  content?: string | null;
  event_date?: string;
  isDeceased?: boolean;
}

const toDateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysDiff = (a: Date, b: Date) => Math.round((toDateOnly(a).getTime() - toDateOnly(b).getTime()) / 86400000);

const nextGregorian = (month: number, day: number, now: Date) => {
  const thisYear = new Date(now.getFullYear(), month - 1, day);
  if (thisYear >= toDateOnly(now)) return thisYear;
  return new Date(now.getFullYear() + 1, month - 1, day);
};

export function computeEvents(
  persons: PersonEventSource[],
  customEvents: CustomEventRecord[],
): FamilyEvent[] {
  const now = new Date();
  const events: FamilyEvent[] = [];

  for (const p of persons ?? []) {
    if (p.birth_month && p.birth_day) {
      const next = nextGregorian(p.birth_month, p.birth_day, now);
      events.push({
        id: `birthday-${p.id}`,
        type: "birthday",
        personId: p.id,
        personName: p.full_name,
        eventDateLabel: `${String(p.birth_day).padStart(2, "0")}/${String(p.birth_month).padStart(2, "0")}`,
        daysUntil: daysDiff(next, now),
        originYear: p.birth_year,
        originDay: p.birth_day,
        originMonth: p.birth_month,
      });
    }

    if (p.is_deceased) {
      if (p.death_lunar_month && p.death_lunar_day) {
        const next = nextGregorian(p.death_lunar_month, p.death_lunar_day, now);
        events.push({
          id: `death-${p.id}`,
          type: "death_anniversary",
          personId: p.id,
          personName: p.full_name,
          eventDateLabel: `${p.death_lunar_day}/${p.death_lunar_month} ÂL`,
          daysUntil: daysDiff(next, now),
          originYear: p.death_year || p.death_lunar_year,
          originDay: p.death_lunar_day,
          originMonth: p.death_lunar_month,
          isDeceased: true,
        });
      } else if (p.death_month && p.death_day) {
        const next = nextGregorian(p.death_month, p.death_day, now);
        events.push({
          id: `death-${p.id}`,
          type: "death_anniversary",
          personId: p.id,
          personName: p.full_name,
          eventDateLabel: `${p.death_day}/${p.death_month}`,
          daysUntil: daysDiff(next, now),
          originYear: p.death_year,
          originDay: p.death_day,
          originMonth: p.death_month,
          isDeceased: true,
        });
      }
    }
  }

  for (const e of customEvents ?? []) {
    const d = new Date(e.event_date);
    const next = nextGregorian(d.getMonth() + 1, d.getDate(), now);
    events.push({
      id: e.id,
      type: "custom_event",
      personName: e.name,
      eventDateLabel: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      daysUntil: daysDiff(next, now),
      event_date: e.event_date,
      content: e.content,
      location: e.location,
    });
  }

  return events.sort((a, b) => a.daysUntil - b.daysUntil);
}
