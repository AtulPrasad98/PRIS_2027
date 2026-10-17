import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  analyses, contacts, evidenceItems, followUps, interactions, profiles, projects, stateHistory, valueMatches,
} from "../drizzle/schema";
import { analyzeConversation, generateIntroduction, generatePersonIntelligence, matchProject } from "./ai";
import { getDb } from "./db";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

const dateInput = z.string().optional().nullable();
const dateValue = (value: string | null | undefined) => value ? new Date(value) : undefined;
const jsonList = z.array(z.string()).default([]);
const confidence = z.enum(["High", "Medium", "Low", "Insufficient Evidence"]);
const relationshipStates = ["Research Pending", "Ready to Connect", "Connected", "Acknowledged", "Conversational", "Shared Relevance", "Developing Relationship", "Opportunity Discussion", "Active Opportunity or Advocacy", "Maintenance", "Paused", "Not Interested", "Closed", "Needs Review"] as const;

function requireDb() {
  return getDb().then(db => {
    if (!db) throw new Error("Database is not available. Please retry when the workspace is connected.");
    return db;
  });
}

async function getProfileForOwner(ownerId: number) {
  const db = await requireDb();
  const existing = await db.select().from(profiles).where(eq(profiles.ownerId, ownerId)).limit(1);
  if (existing[0]) return existing[0];
  const seeded = {
    ownerId,
    professionalPositioning: "PGDM Marketing Management professional building toward research-oriented marketing, business analysis, consulting, customer experience, strategy, and practical AI-assisted workflow roles.",
    background: "User-provided starting point: PGDM Marketing Management; prior Chemical Engineering education; market research exposure; customer-facing and family retail experience; career transition into business-oriented roles.",
    skills: [
      { name: "Secondary research and synthesis", level: "Moderate", evidence: "Market research internship exposure" },
      { name: "Presentation and communication", level: "Moderate", evidence: "User-provided" },
      { name: "Excel / Power BI", level: "Beginner", evidence: "User-provided" },
      { name: "AI-assisted research and prototyping", level: "Active interest", evidence: "Portfolio work and current PRIS project" },
    ],
    careerInterests: "Marketing, market research, business analysis, consulting, client experience, strategy, technology-enabled roles.",
    communicationPreferences: "Human, respectful, warm, professionally confident, concise where appropriate, thoughtful, natural rather than robotic, free of exaggerated claims.",
    disclosureBoundaries: "Keep private career concerns, salary targets, personal doubts, and unconfirmed credentials out of outreach unless explicitly approved.",
    lastConfirmedAt: new Date(),
  };
  await db.insert(profiles).values(seeded);
  const created = await db.select().from(profiles).where(eq(profiles.ownerId, ownerId)).limit(1);
  return created[0];
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  dashboard: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      const [allContacts, allInteractions, allFollowUps] = await Promise.all([
        db.select().from(contacts).where(eq(contacts.ownerId, ctx.user.id)),
        db.select().from(interactions).where(eq(interactions.ownerId, ctx.user.id)).orderBy(desc(interactions.interactionDate)),
        db.select().from(followUps).where(eq(followUps.ownerId, ctx.user.id)).orderBy(desc(followUps.dueAt)),
      ]);
      const upcoming = allFollowUps.filter(item => item.status === "Planned" && item.dueAt >= new Date());
      const actions = allContacts.filter(item => item.nextAction || item.nextActionDueAt).sort((a, b) => (a.nextActionDueAt?.getTime() ?? Infinity) - (b.nextActionDueAt?.getTime() ?? Infinity)).slice(0, 6);
      return {
        counts: {
          total: allContacts.length,
          researched: allContacts.filter(item => Boolean(item.lastResearchAt)).length,
          awaitingInitial: allContacts.filter(item => ["Research Pending", "Ready to Connect"].includes(item.relationshipState)).length,
          activeConversations: allContacts.filter(item => ["Active", "User owes reply", "Recipient owes reply"].includes(item.conversationStatus)).length,
          upcomingFollowUps: upcoming.length,
          opportunities: allContacts.filter(item => ["Explicit", "Active"].includes(item.opportunitySignal)).length,
          needsReview: allContacts.filter(item => item.relationshipState === "Needs Review" || item.researchConfidence === "Insufficient Evidence").length,
        },
        contacts: allContacts,
        recentInteractions: allInteractions.slice(0, 8),
        followUps: upcoming.slice(0, 8),
        actions,
      };
    }),
  }),

  contacts: router({
    list: protectedProcedure.input(z.object({ search: z.string().optional(), state: z.string().optional(), tag: z.string().optional(), status: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
      const db = await requireDb();
      const rows = await db.select().from(contacts).where(eq(contacts.ownerId, ctx.user.id)).orderBy(desc(contacts.updatedAt));
      const search = input?.search?.trim().toLowerCase();
      return rows.filter(row => {
        if (search && ![row.displayName, row.currentRole, row.organization, row.industry].filter(Boolean).join(" ").toLowerCase().includes(search)) return false;
        if (input?.state && input.state !== "All states" && row.relationshipState !== input.state) return false;
        if (input?.status && input.status !== "All statuses" && row.conversationStatus !== input.status) return false;
        if (input?.tag && !(row.tags ?? []).includes(input.tag)) return false;
        return true;
      });
    }),
    byId: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const db = await requireDb();
      const contact = (await db.select().from(contacts).where(and(eq(contacts.id, input.id), eq(contacts.ownerId, ctx.user.id))).limit(1))[0];
      if (!contact) throw new Error("Contact not found");
      const [evidence, interactionRows, analysisRows, followUpRows, stateRows, matches] = await Promise.all([
        db.select().from(evidenceItems).where(and(eq(evidenceItems.contactId, input.id), eq(evidenceItems.ownerId, ctx.user.id))).orderBy(desc(evidenceItems.observedAt)),
        db.select().from(interactions).where(and(eq(interactions.contactId, input.id), eq(interactions.ownerId, ctx.user.id))).orderBy(desc(interactions.interactionDate)),
        db.select().from(analyses).where(and(eq(analyses.contactId, input.id), eq(analyses.ownerId, ctx.user.id))).orderBy(desc(analyses.generatedAt)),
        db.select().from(followUps).where(and(eq(followUps.contactId, input.id), eq(followUps.ownerId, ctx.user.id))).orderBy(desc(followUps.dueAt)),
        db.select().from(stateHistory).where(and(eq(stateHistory.contactId, input.id), eq(stateHistory.ownerId, ctx.user.id))).orderBy(desc(stateHistory.createdAt)),
        db.select().from(valueMatches).where(and(eq(valueMatches.contactId, input.id), eq(valueMatches.ownerId, ctx.user.id))).orderBy(desc(valueMatches.createdAt)),
      ]);
      const projectIds = matches.map(match => match.projectId);
      const matchedProjects = projectIds.length ? await db.select().from(projects).where(and(eq(projects.ownerId, ctx.user.id), inArray(projects.id, projectIds))) : [];
      return { contact, evidence, interactions: interactionRows, analyses: analysisRows, followUps: followUpRows, stateHistory: stateRows, valueMatches: matches.map(match => ({ ...match, project: matchedProjects.find(project => project.id === match.projectId) })) };
    }),
    create: protectedProcedure.input(z.object({ displayName: z.string().min(1), profileUrl: z.string().optional(), currentRole: z.string().optional(), organization: z.string().optional(), industry: z.string().optional(), location: z.string().optional(), connectionRationale: z.string().optional(), tags: jsonList, userNotes: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const result = await db.insert(contacts).values({ ...input, ownerId: ctx.user.id, profileUrl: input.profileUrl || null, currentRole: input.currentRole || null, organization: input.organization || null, industry: input.industry || null, location: input.location || null, connectionRationale: input.connectionRationale || null, userNotes: input.userNotes || null });
      const created = await db.select().from(contacts).where(eq(contacts.id, Number(result[0].insertId))).limit(1);
      return created[0];
    }),
    update: protectedProcedure.input(z.object({ id: z.number(), displayName: z.string().min(1).optional(), profileUrl: z.string().optional().nullable(), currentRole: z.string().optional().nullable(), organization: z.string().optional().nullable(), industry: z.string().optional().nullable(), location: z.string().optional().nullable(), professionalBackground: z.string().optional().nullable(), professionalTopics: z.string().optional().nullable(), notableContributions: z.string().optional().nullable(), sharedInterests: z.string().optional().nullable(), connectionRationale: z.string().optional().nullable(), relationshipState: z.enum(relationshipStates).optional(), conversationStatus: z.string().optional(), nextAction: z.string().optional().nullable(), nextActionDueAt: dateInput, tags: jsonList.optional(), userNotes: z.string().optional().nullable(), professionalRelevance: z.enum(["Low", "Medium", "High"]).optional() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const { id, nextActionDueAt, ...rest } = input;
      const updateValues = { ...rest, conversationStatus: rest.conversationStatus as typeof contacts.$inferInsert.conversationStatus, nextActionDueAt: dateValue(nextActionDueAt) };
      await db.update(contacts).set(updateValues).where(and(eq(contacts.id, id), eq(contacts.ownerId, ctx.user.id)));
      return (await db.select().from(contacts).where(and(eq(contacts.id, id), eq(contacts.ownerId, ctx.user.id))).limit(1))[0];
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const owner = and(eq(contacts.id, input.id), eq(contacts.ownerId, ctx.user.id));
      const child = and(eq(evidenceItems.contactId, input.id), eq(evidenceItems.ownerId, ctx.user.id));
      await db.delete(valueMatches).where(and(eq(valueMatches.contactId, input.id), eq(valueMatches.ownerId, ctx.user.id)));
      await db.delete(analyses).where(and(eq(analyses.contactId, input.id), eq(analyses.ownerId, ctx.user.id)));
      await db.delete(interactions).where(and(eq(interactions.contactId, input.id), eq(interactions.ownerId, ctx.user.id)));
      await db.delete(evidenceItems).where(child);
      await db.delete(followUps).where(and(eq(followUps.contactId, input.id), eq(followUps.ownerId, ctx.user.id)));
      await db.delete(stateHistory).where(and(eq(stateHistory.contactId, input.id), eq(stateHistory.ownerId, ctx.user.id)));
      await db.delete(contacts).where(owner);
      return { success: true };
    }),
  }),

  evidence: router({
    create: protectedProcedure.input(z.object({ contactId: z.number(), sourceTitle: z.string().min(1), sourceUrl: z.string().optional(), sourceType: z.string().default("User-provided note"), observedAt: dateInput, claimSupported: z.string().min(1), evidenceExcerpt: z.string().optional(), evidenceStatus: z.string().default("User-provided"), confidence: confidence.default("Medium"), relevanceReason: z.string().optional(), reviewAt: dateInput })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.insert(evidenceItems).values({ contactId: input.contactId, sourceTitle: input.sourceTitle, ownerId: ctx.user.id, sourceUrl: input.sourceUrl || null, sourceType: input.sourceType as typeof evidenceItems.$inferInsert.sourceType, observedAt: dateValue(input.observedAt) ?? new Date(), publishedAt: null, claimSupported: input.claimSupported, evidenceExcerpt: input.evidenceExcerpt || null, evidenceStatus: input.evidenceStatus as typeof evidenceItems.$inferInsert.evidenceStatus, confidence: input.confidence, relevanceReason: input.relevanceReason || null, reviewAt: dateValue(input.reviewAt) });
      return { success: true };
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => { const db = await requireDb(); await db.delete(evidenceItems).where(and(eq(evidenceItems.id, input.id), eq(evidenceItems.ownerId, ctx.user.id))); return { success: true }; }),
  }),

  interactions: router({
    create: protectedProcedure.input(z.object({ contactId: z.number(), interactionDate: z.string(), channel: z.string().default("LinkedIn"), direction: z.string(), interactionType: z.string().default("Other"), contentOrSummary: z.string().min(1), actualMessageText: z.string().optional(), context: z.string().optional(), userIntendedOutcome: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const row = { ...input, ownerId: ctx.user.id, interactionDate: new Date(input.interactionDate), actualMessageText: input.actualMessageText || null, context: input.context || null, userIntendedOutcome: input.userIntendedOutcome || null, channel: input.channel as typeof interactions.$inferInsert.channel, direction: input.direction as typeof interactions.$inferInsert.direction, interactionType: input.interactionType as typeof interactions.$inferInsert.interactionType };
      const result = await db.insert(interactions).values(row);
      const status = input.direction === "Inbound" ? "User owes reply" : input.direction === "Outbound" ? "Awaiting reply" : "Active";
      await db.update(contacts).set({ conversationStatus: status, updatedAt: new Date() }).where(and(eq(contacts.id, input.contactId), eq(contacts.ownerId, ctx.user.id)));
      return (await db.select().from(interactions).where(eq(interactions.id, Number(result[0].insertId))).limit(1))[0];
    }),
  }),

  ai: router({
    personIntelligence: protectedProcedure.input(z.object({ contactId: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const contact = (await db.select().from(contacts).where(and(eq(contacts.id, input.contactId), eq(contacts.ownerId, ctx.user.id))).limit(1))[0];
      if (!contact) throw new Error("Contact not found");
      const [evidence, profile] = await Promise.all([db.select().from(evidenceItems).where(and(eq(evidenceItems.contactId, input.contactId), eq(evidenceItems.ownerId, ctx.user.id))), getProfileForOwner(ctx.user.id)]);
      const result = await generatePersonIntelligence({ contact, evidence, profile });
      await db.insert(analyses).values({ ownerId: ctx.user.id, contactId: input.contactId, kind: "Person intelligence", confidence: result.confidence, output: result as unknown as Record<string, unknown>, neutralSummary: result.professionalRelevance, rationale: result.recommendedContextToMention.join("\n"), unknowns: result.unknowns.join("\n"), directEvidence: [...result.verifiedFacts, ...result.userProvidedFacts].join("\n"), generatedAt: new Date() });
      await db.update(contacts).set({ researchConfidence: result.confidence, lastResearchAt: new Date(), professionalBackground: result.professionalRelevance, professionalTopics: result.recommendedContextToMention.join(", "), updatedAt: new Date() }).where(and(eq(contacts.id, input.contactId), eq(contacts.ownerId, ctx.user.id)));
      return result;
    }),
    introduction: protectedProcedure.input(z.object({ contactId: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const contact = (await db.select().from(contacts).where(and(eq(contacts.id, input.contactId), eq(contacts.ownerId, ctx.user.id))).limit(1))[0];
      if (!contact) throw new Error("Contact not found");
      const [evidence, profile, prior] = await Promise.all([
        db.select().from(evidenceItems).where(and(eq(evidenceItems.contactId, input.contactId), eq(evidenceItems.ownerId, ctx.user.id))),
        getProfileForOwner(ctx.user.id),
        db.select().from(interactions).where(and(eq(interactions.contactId, input.contactId), eq(interactions.ownerId, ctx.user.id))).orderBy(desc(interactions.interactionDate)),
      ]);
      const result = await generateIntroduction({ contact, evidence, profile, priorInteractions: prior.slice(0, 5) });
      await db.insert(analyses).values({ ownerId: ctx.user.id, contactId: input.contactId, kind: "Introduction", confidence: result.confidence, draftMessage: result.message, rationale: result.rationale, directEvidence: result.evidence.join("\n"), unknowns: result.alternative, output: result as unknown as Record<string, unknown>, generatedAt: new Date() });
      return result;
    }),
    conversation: protectedProcedure.input(z.object({ contactId: z.number(), interactionId: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const contact = (await db.select().from(contacts).where(and(eq(contacts.id, input.contactId), eq(contacts.ownerId, ctx.user.id))).limit(1))[0];
      const interaction = (await db.select().from(interactions).where(and(eq(interactions.id, input.interactionId), eq(interactions.ownerId, ctx.user.id))).limit(1))[0];
      if (!contact || !interaction) throw new Error("Contact or interaction not found");
      const [history, profile, lastAnalysis] = await Promise.all([
        db.select().from(interactions).where(and(eq(interactions.contactId, input.contactId), eq(interactions.ownerId, ctx.user.id))).orderBy(desc(interactions.interactionDate)),
        getProfileForOwner(ctx.user.id),
        db.select().from(analyses).where(and(eq(analyses.contactId, input.contactId), eq(analyses.ownerId, ctx.user.id))).orderBy(desc(analyses.generatedAt)).limit(3),
      ]);
      const result = await analyzeConversation({ contact, latestInteraction: interaction, priorInteractions: history.slice(0, 8), priorAnalyses: lastAnalysis, profile });
      await db.insert(analyses).values({ ownerId: ctx.user.id, contactId: input.contactId, interactionId: input.interactionId, kind: "Conversation", neutralSummary: result.neutralSummary, directEvidence: result.directEvidence.join("\n"), interpretation: result.interpretation, currentRelationshipState: result.currentState, proposedRelationshipState: result.proposedState, opennessRating: result.opennessRating === "Unclear" ? null : Number(result.opennessRating), opennessEvidence: result.opennessEvidence, opportunitySignal: result.opportunitySignal, recommendedAction: result.recommendedAction, rationale: result.rationale, draftMessage: result.draftMessage, timingGuidance: result.timingGuidance, unknowns: result.unknowns.join("\n"), confidence: result.confidence, output: result as unknown as Record<string, unknown>, generatedAt: new Date() });
      await db.update(contacts).set({ opennessRating: result.opennessRating === "Unclear" ? null : Number(result.opennessRating), opennessEvidence: result.opennessEvidence, opportunitySignal: result.opportunitySignal, nextAction: result.recommendedAction, researchConfidence: result.confidence, updatedAt: new Date() }).where(and(eq(contacts.id, input.contactId), eq(contacts.ownerId, ctx.user.id)));
      return result;
    }),
    matchProject: protectedProcedure.input(z.object({ contactId: z.number(), projectId: z.number() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [contact, project, profile, history] = await Promise.all([
        db.select().from(contacts).where(and(eq(contacts.id, input.contactId), eq(contacts.ownerId, ctx.user.id))).limit(1),
        db.select().from(projects).where(and(eq(projects.id, input.projectId), eq(projects.ownerId, ctx.user.id))).limit(1),
        getProfileForOwner(ctx.user.id),
        db.select().from(interactions).where(and(eq(interactions.contactId, input.contactId), eq(interactions.ownerId, ctx.user.id))).orderBy(desc(interactions.interactionDate)),
      ]);
      if (!contact[0] || !project[0]) throw new Error("Contact or project not found");
      const result = await matchProject({ contact: contact[0], project: project[0], profile, recentInteractions: history.slice(0, 5) });
      await db.insert(valueMatches).values({ ownerId: ctx.user.id, contactId: input.contactId, projectId: input.projectId, recipientContext: contact[0].professionalTopics || contact[0].currentRole || "Unknown", relevanceExplanation: result.relevanceExplanation, suggestedContribution: result.suggestedContribution, readinessToShare: result.readinessToShare, confidence: result.confidence });
      return result;
    }),
  }),

  analyses: router({
    decide: protectedProcedure.input(z.object({ id: z.number(), decision: z.enum(["Approved", "Edited", "Rejected", "Deferred"]), feedback: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const analysis = (await db.select().from(analyses).where(and(eq(analyses.id, input.id), eq(analyses.ownerId, ctx.user.id))).limit(1))[0];
      if (!analysis) throw new Error("Analysis not found");
      await db.update(analyses).set({ userDecision: input.decision, userFeedback: input.feedback || null }).where(eq(analyses.id, input.id));
      if (input.decision === "Approved" && analysis.proposedRelationshipState && relationshipStates.includes(analysis.proposedRelationshipState as typeof relationshipStates[number])) {
        const contact = (await db.select().from(contacts).where(and(eq(contacts.id, analysis.contactId), eq(contacts.ownerId, ctx.user.id))).limit(1))[0];
        if (contact && contact.relationshipState !== analysis.proposedRelationshipState) {
          await db.update(contacts).set({ relationshipState: analysis.proposedRelationshipState as typeof contacts.$inferInsert.relationshipState, updatedAt: new Date() }).where(eq(contacts.id, analysis.contactId));
          await db.insert(stateHistory).values({ ownerId: ctx.user.id, contactId: analysis.contactId, previousState: contact.relationshipState, newState: analysis.proposedRelationshipState, reason: analysis.rationale || "Approved from analysis", evidence: analysis.directEvidence || null });
        }
      }
      return { success: true };
    }),
  }),

  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => { const db = await requireDb(); return db.select().from(projects).where(eq(projects.ownerId, ctx.user.id)).orderBy(desc(projects.updatedAt)); }),
    create: protectedProcedure.input(z.object({ name: z.string().min(1), description: z.string().optional(), problemAddressed: z.string().optional(), intendedUser: z.string().optional(), contribution: z.string().optional(), toolsUsed: z.string().optional(), skillsDemonstrated: z.string().optional(), evidenceOfCompletion: z.string().optional(), verifiedOutcomes: z.string().optional(), publicUrl: z.string().optional(), intendedAudience: z.string().optional(), relevantIndustries: z.string().optional(), relevantTopics: z.string().optional(), limitations: z.string().optional() })).mutation(async ({ ctx, input }) => { const db = await requireDb(); const result = await db.insert(projects).values({ ...input, ownerId: ctx.user.id }); return (await db.select().from(projects).where(eq(projects.id, Number(result[0].insertId))).limit(1))[0]; }),
    update: protectedProcedure.input(z.object({ id: z.number(), name: z.string().min(1), description: z.string().optional().nullable(), problemAddressed: z.string().optional().nullable(), intendedUser: z.string().optional().nullable(), contribution: z.string().optional().nullable(), toolsUsed: z.string().optional().nullable(), skillsDemonstrated: z.string().optional().nullable(), evidenceOfCompletion: z.string().optional().nullable(), verifiedOutcomes: z.string().optional().nullable(), publicUrl: z.string().optional().nullable(), intendedAudience: z.string().optional().nullable(), relevantIndustries: z.string().optional().nullable(), relevantTopics: z.string().optional().nullable(), limitations: z.string().optional().nullable() })).mutation(async ({ ctx, input }) => { const db = await requireDb(); const { id, ...values } = input; await db.update(projects).set({ ...values, updatedAt: new Date() }).where(and(eq(projects.id, id), eq(projects.ownerId, ctx.user.id))); return { success: true }; }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => { const db = await requireDb(); await db.delete(projects).where(and(eq(projects.id, input.id), eq(projects.ownerId, ctx.user.id))); return { success: true }; }),
  }),

  profile: router({
    get: protectedProcedure.query(({ ctx }) => getProfileForOwner(ctx.user.id)),
    update: protectedProcedure.input(z.object({ professionalPositioning: z.string().optional(), background: z.string().optional(), skills: z.array(z.object({ name: z.string(), level: z.string(), evidence: z.string().optional() })).optional(), careerInterests: z.string().optional(), communicationPreferences: z.string().optional(), disclosureBoundaries: z.string().optional() })).mutation(async ({ ctx, input }) => { const db = await requireDb(); await getProfileForOwner(ctx.user.id); await db.update(profiles).set({ ...input, lastConfirmedAt: new Date(), updatedAt: new Date() }).where(eq(profiles.ownerId, ctx.user.id)); return getProfileForOwner(ctx.user.id); }),
  }),

  followUps: router({
    list: protectedProcedure.input(z.object({ includeCompleted: z.boolean().optional() }).optional()).query(async ({ ctx, input }) => { const db = await requireDb(); const rows = await db.select().from(followUps).where(eq(followUps.ownerId, ctx.user.id)).orderBy(desc(followUps.dueAt)); return input?.includeCompleted ? rows : rows.filter(row => row.status === "Planned"); }),
    create: protectedProcedure.input(z.object({ contactId: z.number(), dueAt: z.string(), reason: z.string().min(1) })).mutation(async ({ ctx, input }) => { const db = await requireDb(); const result = await db.insert(followUps).values({ ownerId: ctx.user.id, contactId: input.contactId, dueAt: new Date(input.dueAt), reason: input.reason, status: "Planned" }); await db.update(contacts).set({ nextActionDueAt: new Date(input.dueAt), updatedAt: new Date() }).where(and(eq(contacts.id, input.contactId), eq(contacts.ownerId, ctx.user.id))); return (await db.select().from(followUps).where(eq(followUps.id, Number(result[0].insertId))).limit(1))[0]; }),
    update: protectedProcedure.input(z.object({ id: z.number(), status: z.enum(["Planned", "Completed", "Dismissed"]), dueAt: z.string().optional() })).mutation(async ({ ctx, input }) => { const db = await requireDb(); await db.update(followUps).set({ status: input.status, dueAt: input.dueAt ? new Date(input.dueAt) : undefined, completedAt: input.status === "Completed" ? new Date() : null }).where(and(eq(followUps.id, input.id), eq(followUps.ownerId, ctx.user.id))); return { success: true }; }),
  }),

  exportData: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDb();
    const [contactRows, evidence, interactionRows, analysisRows, projectRows, matches, followUpRows, states, profile] = await Promise.all([
      db.select().from(contacts).where(eq(contacts.ownerId, ctx.user.id)),
      db.select().from(evidenceItems).where(eq(evidenceItems.ownerId, ctx.user.id)),
      db.select().from(interactions).where(eq(interactions.ownerId, ctx.user.id)),
      db.select().from(analyses).where(eq(analyses.ownerId, ctx.user.id)),
      db.select().from(projects).where(eq(projects.ownerId, ctx.user.id)),
      db.select().from(valueMatches).where(eq(valueMatches.ownerId, ctx.user.id)),
      db.select().from(followUps).where(eq(followUps.ownerId, ctx.user.id)),
      db.select().from(stateHistory).where(eq(stateHistory.ownerId, ctx.user.id)),
      getProfileForOwner(ctx.user.id),
    ]);
    return { exportedAt: new Date(), profile, contacts: contactRows, evidence, interactions: interactionRows, analyses: analysisRows, projects: projectRows, valueMatches: matches, followUps: followUpRows, stateHistory: states };
  }),
});

export type AppRouter = typeof appRouter;
