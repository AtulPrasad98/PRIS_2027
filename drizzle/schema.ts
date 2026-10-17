import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

const relationshipStates = [
  "Research Pending", "Ready to Connect", "Connected", "Acknowledged", "Conversational",
  "Shared Relevance", "Developing Relationship", "Opportunity Discussion",
  "Active Opportunity or Advocacy", "Maintenance", "Paused", "Not Interested", "Closed", "Needs Review",
] as const;
const conversationStatuses = ["No conversation", "Awaiting reply", "User owes reply", "Recipient owes reply", "Active", "Dormant", "Closed"] as const;
const confidenceLevels = ["High", "Medium", "Low", "Insufficient Evidence"] as const;

export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  displayName: varchar("displayName", { length: 180 }).notNull(),
  profileUrl: varchar("profileUrl", { length: 600 }),
  currentRole: varchar("currentRole", { length: 220 }),
  organization: varchar("organization", { length: 220 }),
  industry: varchar("industry", { length: 160 }),
  location: varchar("location", { length: 160 }),
  professionalBackground: text("professionalBackground"),
  professionalTopics: text("professionalTopics"),
  notableContributions: text("notableContributions"),
  sharedInterests: text("sharedInterests"),
  connectionRationale: text("connectionRationale"),
  professionalRelevance: mysqlEnum("professionalRelevance", ["Low", "Medium", "High"]),
  relationshipState: mysqlEnum("relationshipState", relationshipStates).default("Research Pending").notNull(),
  conversationStatus: mysqlEnum("conversationStatus", conversationStatuses).default("No conversation").notNull(),
  opennessRating: int("opennessRating"),
  opennessEvidence: text("opennessEvidence"),
  opportunitySignal: mysqlEnum("opportunitySignal", ["None", "Possible", "Explicit", "Active"]).default("None").notNull(),
  nextAction: varchar("nextAction", { length: 220 }),
  nextActionDueAt: timestamp("nextActionDueAt"),
  tags: json("tags").$type<string[]>(),
  userNotes: text("userNotes"),
  researchConfidence: mysqlEnum("researchConfidence", confidenceLevels).default("Insufficient Evidence").notNull(),
  lastResearchAt: timestamp("lastResearchAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const evidenceItems = mysqlTable("evidenceItems", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  contactId: int("contactId").notNull(),
  sourceTitle: varchar("sourceTitle", { length: 240 }).notNull(),
  sourceUrl: varchar("sourceUrl", { length: 700 }),
  sourceType: mysqlEnum("sourceType", ["Official bio", "Company page", "Article", "Public post", "Portfolio", "User-provided note", "Other"]).default("User-provided note").notNull(),
  observedAt: timestamp("observedAt").defaultNow().notNull(),
  publishedAt: timestamp("publishedAt"),
  claimSupported: text("claimSupported").notNull(),
  evidenceExcerpt: text("evidenceExcerpt"),
  evidenceStatus: mysqlEnum("evidenceStatus", ["Verified", "User-provided", "Inference", "Unknown", "Outdated"]).default("User-provided").notNull(),
  confidence: mysqlEnum("confidence", confidenceLevels).default("Medium").notNull(),
  relevanceReason: text("relevanceReason"),
  reviewAt: timestamp("reviewAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const interactions = mysqlTable("interactions", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  contactId: int("contactId").notNull(),
  interactionDate: timestamp("interactionDate").notNull(),
  channel: mysqlEnum("channel", ["LinkedIn", "Email", "Event", "Call", "Other"]).default("LinkedIn").notNull(),
  direction: mysqlEnum("direction", ["Outbound", "Inbound", "In-person", "Other"]).notNull(),
  interactionType: mysqlEnum("interactionType", ["Connection note", "First message", "Reply", "Follow-up", "Resource shared", "Meeting", "Other"]).default("Other").notNull(),
  contentOrSummary: text("contentOrSummary").notNull(),
  actualMessageText: text("actualMessageText"),
  context: text("context"),
  userIntendedOutcome: text("userIntendedOutcome"),
  sourceOfRecord: mysqlEnum("sourceOfRecord", ["Manually entered", "Imported by user"]).default("Manually entered").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  contactId: int("contactId").notNull(),
  interactionId: int("interactionId"),
  kind: mysqlEnum("kind", ["Person intelligence", "Introduction", "Conversation", "Project match"]).notNull(),
  neutralSummary: text("neutralSummary"),
  directEvidence: text("directEvidence"),
  interpretation: text("interpretation"),
  currentRelationshipState: varchar("currentRelationshipState", { length: 120 }),
  proposedRelationshipState: varchar("proposedRelationshipState", { length: 120 }),
  opennessRating: int("opennessRating"),
  opennessEvidence: text("opennessEvidence"),
  opportunitySignal: varchar("opportunitySignal", { length: 40 }),
  recommendedAction: varchar("recommendedAction", { length: 220 }),
  rationale: text("rationale"),
  draftMessage: text("draftMessage"),
  timingGuidance: text("timingGuidance"),
  unknowns: text("unknowns"),
  confidence: mysqlEnum("confidence", confidenceLevels).default("Medium").notNull(),
  output: json("output").$type<Record<string, unknown>>(),
  userDecision: mysqlEnum("userDecision", ["Approved", "Edited", "Rejected", "Deferred", "N/A"]).default("N/A").notNull(),
  userFeedback: text("userFeedback"),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: varchar("name", { length: 220 }).notNull(),
  description: text("description"),
  problemAddressed: text("problemAddressed"),
  intendedUser: text("intendedUser"),
  contribution: text("contribution"),
  toolsUsed: text("toolsUsed"),
  skillsDemonstrated: text("skillsDemonstrated"),
  evidenceOfCompletion: text("evidenceOfCompletion"),
  verifiedOutcomes: text("verifiedOutcomes"),
  publicUrl: varchar("publicUrl", { length: 700 }),
  intendedAudience: text("intendedAudience"),
  relevantIndustries: text("relevantIndustries"),
  relevantTopics: text("relevantTopics"),
  limitations: text("limitations"),
  isConfirmed: int("isConfirmed").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const valueMatches = mysqlTable("valueMatches", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  contactId: int("contactId").notNull(),
  projectId: int("projectId").notNull(),
  recipientContext: text("recipientContext"),
  relevanceExplanation: text("relevanceExplanation"),
  suggestedContribution: text("suggestedContribution"),
  readinessToShare: mysqlEnum("readinessToShare", ["Ready", "Needs user review", "Not ready"]).default("Needs user review").notNull(),
  confidence: mysqlEnum("confidence", confidenceLevels).default("Medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const followUps = mysqlTable("followUps", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  contactId: int("contactId").notNull(),
  dueAt: timestamp("dueAt").notNull(),
  reason: text("reason").notNull(),
  status: mysqlEnum("status", ["Planned", "Completed", "Dismissed"]).default("Planned").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const stateHistory = mysqlTable("stateHistory", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  contactId: int("contactId").notNull(),
  previousState: varchar("previousState", { length: 120 }),
  newState: varchar("newState", { length: 120 }).notNull(),
  reason: text("reason").notNull(),
  evidence: text("evidence"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().unique(),
  professionalPositioning: text("professionalPositioning"),
  background: text("background"),
  skills: json("skills").$type<Array<{ name: string; level: string; evidence?: string }>>(),
  careerInterests: text("careerInterests"),
  communicationPreferences: text("communicationPreferences"),
  disclosureBoundaries: text("disclosureBoundaries"),
  lastConfirmedAt: timestamp("lastConfirmedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type Interaction = typeof interactions.$inferSelect;
export type Project = typeof projects.$inferSelect;
