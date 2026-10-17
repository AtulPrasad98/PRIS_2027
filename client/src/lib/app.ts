export const relationshipStates = ["Research Pending", "Ready to Connect", "Connected", "Acknowledged", "Conversational", "Shared Relevance", "Developing Relationship", "Opportunity Discussion", "Active Opportunity or Advocacy", "Maintenance", "Paused", "Not Interested", "Closed", "Needs Review"];

export const stateShort: Record<string, string> = {
  "Research Pending": "Research pending",
  "Ready to Connect": "Ready to connect",
  "Connected": "Connected",
  "Acknowledged": "Acknowledged",
  "Conversational": "Conversational",
  "Shared Relevance": "Shared relevance",
  "Developing Relationship": "Developing",
  "Opportunity Discussion": "Opportunity discussion",
  "Active Opportunity or Advocacy": "Active opportunity",
  "Maintenance": "Maintenance",
  "Paused": "Paused",
  "Not Interested": "Not interested",
  "Closed": "Closed",
  "Needs Review": "Needs review",
};

export function formatDate(value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "Not set";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-IN", options ?? { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function formatRelative(value: string | Date | null | undefined) {
  if (!value) return "No activity yet";
  const date = value instanceof Date ? value : new Date(value);
  const days = Math.round((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 14) return `${days} days ago`;
  return formatDate(date, { day: "numeric", month: "short" });
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
