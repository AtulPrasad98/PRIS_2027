export const relationshipStates = ["Research Pending", "Ready to Connect", "Connected", "Acknowledged", "Conversational", "Shared Relevance", "Developing Relationship", "Opportunity Discussion", "Active Opportunity or Advocacy", "Maintenance", "Paused", "Not Interested", "Closed", "Needs Review"];

export const stateShort: Record<string, string> = {
  "Research Pending": "Research pending",
  "Ready to Connect": "Ready to connect",
  Connected: "Connected",
  Acknowledged: "Acknowledged",
  Conversational: "Conversational",
  "Shared Relevance": "Shared relevance",
  "Developing Relationship": "Developing",
  "Opportunity Discussion": "Opportunity discussion",
  "Active Opportunity or Advocacy": "Active opportunity",
  Maintenance: "Maintenance",
  Paused: "Paused",
  "Not Interested": "Not interested",
  Closed: "Closed",
  "Needs Review": "Needs review",
};

export const INDIA_TIME_ZONE = "Asia/Kolkata";

export function formatDate(value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "Not set";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-IN", { timeZone: INDIA_TIME_ZONE, ...(options ?? { day: "numeric", month: "short", year: "numeric" }) }).format(date);
}

function indianCalendarKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: INDIA_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function formatRelative(value: string | Date | null | undefined) {
  if (!value) return "No activity yet";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "No activity yet";
  const today = indianCalendarKey(new Date());
  const target = indianCalendarKey(date);
  const days = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${target}T00:00:00Z`)) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 14) return `${days} days ago`;
  return formatDate(date, { day: "numeric", month: "short" });
}

export function formatDateKey(value: Date = new Date()) {
  return indianCalendarKey(value);
}

export function formatDateTimeLocal(value: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: INDIA_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(value);
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? "00";
  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}

export function asIndianDateTime(value: string) {
  return /(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}:00+05:30`;
}

export function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "?";
}

export function safeList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(item => typeof item === "string") as string[] : [];
}

export function confidenceTone(confidence?: string | null) {
  if (confidence === "High") return "tone-high";
  if (confidence === "Medium") return "tone-medium";
  if (confidence === "Low") return "tone-low";
  return "tone-muted";
}
