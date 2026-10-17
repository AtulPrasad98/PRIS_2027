import { invokeLLM } from "./_core/llm";

const MODEL = "gpt-5-mini";

type JsonSchema = Record<string, unknown>;

function contentText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map(part => (typeof part === "string" ? part : (part as { text?: string }).text ?? "")).join("\n");
  }
  return "";
}

function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1)) as T;
    throw new Error("The AI returned an unreadable structured result.");
  }
}

async function generateStructured<T>(name: string, schema: JsonSchema, system: string, user: string): Promise<T> {
  const messages = [{ role: "system" as const, content: system }, { role: "user" as const, content: user }];
  try {
    const result = await invokeLLM({
      model: MODEL,
      messages,
      maxTokens: 1800,
      responseFormat: { type: "json_schema", json_schema: { name, strict: true, schema } },
    });
    const raw = contentText(result.choices?.[0]?.message?.content);
    if (!raw) throw new Error("The AI returned no structured content.");
    return parseJson<T>(raw);
  } catch (firstError) {
    try {
      const recovery = await invokeLLM({
        model: MODEL,
        messages: [...messages, { role: "user" as const, content: "Return only a valid JSON object matching the requested fields. Do not use Markdown fences." }],
        maxTokens: 1800,
        responseFormat: { type: "json_object" },
      });
      const raw = contentText(recovery.choices?.[0]?.message?.content);
      if (!raw) throw firstError;
      return parseJson<T>(raw);
    } catch {
      throw firstError instanceof Error ? firstError : new Error("AI analysis failed. Please retry.");
    }
  }
}

const sharedSystem = `You are the reasoning layer of a privacy-conscious Professional Relationship Intelligence System. Evidence before personalization. Never invent facts, sources, shared interests, recipient intent, hiring status, relationship history, outcomes, or user capabilities. Treat contact fields as user-provided unless explicitly labeled verified. Keep fact, inference, unknown, and outdated information separate. Do not infer sensitive traits or private life. Relationship before transaction: do not jump to jobs, referrals, or pitches from politeness. Human review is required before any external action. Use concise, practical language.`;

export type PersonIntelligence = {
  verifiedFacts: string[];
  userProvidedFacts: string[];
  inferences: string[];
  unknowns: string[];
  sources: string[];
  professionalRelevance: string;
  recommendedContextToMention: string[];
  detailsToAvoid: string[];
  confidence: "High" | "Medium" | "Low" | "Insufficient Evidence";
};

export async function generatePersonIntelligence(input: {
  contact: Record<string, unknown>;
  evidence: Array<Record<string, unknown>>;
  profile: Record<string, unknown>;
}) {
  return generateStructured<PersonIntelligence>("person_intelligence", {
    type: "object",
    additionalProperties: false,
    required: ["verifiedFacts", "userProvidedFacts", "inferences", "unknowns", "sources", "professionalRelevance", "recommendedContextToMention", "detailsToAvoid", "confidence"],
    properties: {
      verifiedFacts: { type: "array", items: { type: "string" } },
      userProvidedFacts: { type: "array", items: { type: "string" } },
      inferences: { type: "array", items: { type: "string" } },
      unknowns: { type: "array", items: { type: "string" } },
      sources: { type: "array", items: { type: "string" } },
      professionalRelevance: { type: "string" },
      recommendedContextToMention: { type: "array", items: { type: "string" } },
      detailsToAvoid: { type: "array", items: { type: "string" } },
      confidence: { type: "string", enum: ["High", "Medium", "Low", "Insufficient Evidence"] },
    },
  }, sharedSystem + " You are currently acting as the Research Analyst. Make the evidence quality explicit.", JSON.stringify(input));
}

export type IntroductionDraft = {
  message: string;
  rationale: string;
  evidence: string[];
  alternative: string;
  confidence: "High" | "Medium" | "Low" | "Insufficient Evidence";
};

export async function generateIntroduction(input: Record<string, unknown>) {
  return generateStructured<IntroductionDraft>("introduction_draft", {
    type: "object",
    additionalProperties: false,
    required: ["message", "rationale", "evidence", "alternative", "confidence"],
    properties: {
      message: { type: "string" }, rationale: { type: "string" }, evidence: { type: "array", items: { type: "string" } }, alternative: { type: "string" }, confidence: { type: "string", enum: ["High", "Medium", "Low", "Insufficient Evidence"] },
    },
  }, sharedSystem + " You are drafting a first professional introduction. Be warm, concise, specific only where supported, easy to decline, and ask no more than one good question. Do not mention a job search, referral, portfolio, or project unless the context clearly supports it. This is a draft for editing, never a send action.", JSON.stringify(input));
}

export type ConversationAnalysis = {
  neutralSummary: string;
  directEvidence: string[];
  interpretation: string;
  currentState: string;
  proposedState: string;
  opennessRating: "1" | "2" | "3" | "4" | "5" | "Unclear";
  opennessEvidence: string;
  opportunitySignal: "None" | "Possible" | "Explicit" | "Active";
  recommendedAction: string;
  rationale: string;
  draftMessage: string;
  timingGuidance: string;
  unknowns: string[];
  confidence: "High" | "Medium" | "Low" | "Insufficient Evidence";
  shouldReply: boolean;
  projectShareReadiness: string;
};

export async function analyzeConversation(input: Record<string, unknown>) {
  return generateStructured<ConversationAnalysis>("conversation_analysis", {
    type: "object",
    additionalProperties: false,
    required: ["neutralSummary", "directEvidence", "interpretation", "currentState", "proposedState", "opennessRating", "opennessEvidence", "opportunitySignal", "recommendedAction", "rationale", "draftMessage", "timingGuidance", "unknowns", "confidence", "shouldReply", "projectShareReadiness"],
    properties: {
      neutralSummary: { type: "string" }, directEvidence: { type: "array", items: { type: "string" } }, interpretation: { type: "string" }, currentState: { type: "string" }, proposedState: { type: "string" }, opennessRating: { type: "string", enum: ["1", "2", "3", "4", "5", "Unclear"] }, opennessEvidence: { type: "string" }, opportunitySignal: { type: "string", enum: ["None", "Possible", "Explicit", "Active"] }, recommendedAction: { type: "string" }, rationale: { type: "string" }, draftMessage: { type: "string" }, timingGuidance: { type: "string" }, unknowns: { type: "array", items: { type: "string" } }, confidence: { type: "string", enum: ["High", "Medium", "Low", "Insufficient Evidence"] }, shouldReply: { type: "boolean" }, projectShareReadiness: { type: "string" },
    },
  }, sharedSystem + " You are currently acting as the Relationship and Conversation Analyst. Use the five-level openness rubric: 1 minimal/closed, 2 polite acknowledgement, 3 engaged response, 4 reciprocal engagement, 5 explicit invitation. Friendly tone alone is not high openness. A clear no-contact boundary must produce STOP. A direct question or promised reply takes priority. Recommend one primary next action, including WAIT, NO ACTION, RESEARCH, or STOP when appropriate. Never infer a job or referral from a polite reply.", JSON.stringify(input));
}

export type ProjectMatch = {
  relevanceExplanation: string;
  suggestedContribution: string;
  readinessToShare: "Ready" | "Needs user review" | "Not ready";
  confidence: "High" | "Medium" | "Low" | "Insufficient Evidence";
};

export async function matchProject(input: Record<string, unknown>) {
  return generateStructured<ProjectMatch>("project_match", {
    type: "object",
    additionalProperties: false,
    required: ["relevanceExplanation", "suggestedContribution", "readinessToShare", "confidence"],
    properties: { relevanceExplanation: { type: "string" }, suggestedContribution: { type: "string" }, readinessToShare: { type: "string", enum: ["Ready", "Needs user review", "Not ready"] }, confidence: { type: "string", enum: ["High", "Medium", "Low", "Insufficient Evidence"] } },
  }, sharedSystem + " You are currently acting as the Personal Value Proposition Strategist. Match at most one verified project. Recommend sharing only when the conversation or recipient context makes it directly relevant. Never invent project results, capabilities, or recipient interest. Explain whether waiting is better than sharing now.", JSON.stringify(input));
}
