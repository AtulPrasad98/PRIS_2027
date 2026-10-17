import PrisShell, { EmptyState, MetricCard, SectionHeading } from "@/components/PrisShell";
import { formatDate, formatRelative, stateShort } from "@/lib/app";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CheckCircle2, CircleAlert, Clock3, MessageCircle, Search, Sparkles } from "lucide-react";
import { Link } from "wouter";

const states = ["Research Pending", "Ready to Connect", "Connected", "Acknowledged", "Conversational", "Shared Relevance", "Developing Relationship", "Opportunity Discussion"];

export default function Home() {
  const summary = trpc.dashboard.summary.useQuery();
  const data = summary.data;
  const contacts = data?.contacts ?? [];
  const counts = data?.counts;
  const maxPipeline = Math.max(1, ...states.map(state => contacts.filter(contact => contact.relationshipState === state).length));
  return <PrisShell eyebrow="Monday, 12 October 2026" title="Make the next move thoughtful." description="A private relationship workspace for understanding people, keeping context, and choosing the right moment to engage." actions={<Link href="/contacts" className="button primary"><Search size={15} /> Open contacts</Link>}>
    <div className="dashboard-grid">
      <div className="metrics-grid">
        <MetricCard label="Contacts" value={counts?.total ?? "—"} note="Selected network" accent />
        <MetricCard label="Researched" value={counts?.researched ?? "—"} note="Evidence on file" />
        <MetricCard label="Ready to connect" value={counts?.awaitingInitial ?? "—"} note="Context available" />
        <MetricCard label="Conversations" value={counts?.activeConversations ?? "—"} note="Need attention" />
        <MetricCard label="Follow-ups" value={counts?.upcomingFollowUps ?? "—"} note="Planned, not arbitrary" />
        <MetricCard label="Opportunities" value={counts?.opportunities ?? "—"} note="Explicit signals only" />
        <MetricCard label="Review" value={counts?.needsReview ?? "—"} note="Evidence or state gaps" />
      </div>
      <div className="content-grid">
        <div className="panel panel-pad">
          <SectionHeading eyebrow="Decision queue" title="Recommended actions" note="One clear next move is better than a busy sequence." action={<Link href="/contacts" className="button small ghost">View all <ArrowRight size={13} /></Link>} />
          {data?.actions?.length ? <div className="action-list">{data.actions.map(contact => <Link key={contact.id} href={`/contacts/${contact.id}`} className="action-row"><div className="action-icon"><Sparkles size={15} /></div><div className="action-copy"><strong>{contact.displayName}</strong><span>{contact.nextAction ?? "Review this relationship"}</span></div><div className="action-date">{contact.nextActionDueAt ? formatDate(contact.nextActionDueAt, { day: "numeric", month: "short" }) : "No date"}</div><ArrowRight size={14} color="#8a9891" /></Link>)}</div> : <EmptyState title="The queue is clear" body="Add a contact or record an interaction to see evidence-based next moves here." action={<Link href="/contacts" className="button small">Add a contact</Link>} />}
        </div>
        <div className="panel panel-pad">
          <SectionHeading eyebrow="Relationship map" title="Where relationships are" note="State is history, not a score." action={<Link href="/pipeline" className="button small ghost">Open pipeline <ArrowRight size={13} /></Link>} />
          <div className="pipeline-list">{states.map(state => { const count = contacts.filter(contact => contact.relationshipState === state).length; return <div className="pipeline-row" key={state}><div className="pipeline-label">{stateShort[state]}</div><div className="pipeline-track"><div className="pipeline-fill" style={{ width: `${Math.max(3, count / maxPipeline * 100)}%`, opacity: count ? 1 : .22 }} /></div><div className="pipeline-count">{count}</div></div>; })}</div>
        </div>
      </div>
      <div className="content-grid">
        <div className="panel panel-pad">
          <SectionHeading eyebrow="Memory" title="Recent activity" note="Actual interactions and decisions, in order." />
          {data?.recentInteractions?.length ? <div className="activity-list">{data.recentInteractions.map(item => { const contact = contacts.find(c => c.id === item.contactId); return <Link className="activity-row" href={`/contacts/${item.contactId}`} key={item.id}><div className="activity-dot" /><div><strong>{contact?.displayName ?? "Contact"} · {item.direction}</strong><p>{item.contentOrSummary}</p></div><div className="activity-time">{formatRelative(item.interactionDate)}</div></Link>; })}</div> : <EmptyState title="No interactions recorded" body="The timeline becomes useful when you record the exact message you sent or the response you received." action={<Link href="/contacts" className="button small">Find a contact</Link>} />}
        </div>
        <div className="panel panel-pad">
          <SectionHeading eyebrow="Time horizon" title="Upcoming follow-ups" note="Only reminders with a reason belong here." action={<Link href="/follow-ups" className="button small ghost">Manage <ArrowRight size={13} /></Link>} />
          {data?.followUps?.length ? <div className="action-list">{data.followUps.map(item => { const contact = contacts.find(c => c.id === item.contactId); return <Link key={item.id} href={`/contacts/${item.contactId}`} className="action-row"><div className="action-icon"><Clock3 size={15} /></div><div className="action-copy"><strong>{contact?.displayName ?? "Contact"}</strong><span>{item.reason}</span></div><div className="action-date">{formatDate(item.dueAt, { day: "numeric", month: "short" })}</div></Link>; })}</div> : <EmptyState title="Nothing scheduled" body="A follow-up should have a genuine reason, an agreed next step, or a promised resource." action={<Link href="/follow-ups" className="button small">Review policy</Link>} />}
        </div>
      </div>
      <div className="panel panel-pad" style={{ background: "#eef5ef", borderColor: "#dce9de" }}><div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}><CheckCircle2 size={18} color="#47645a" /><div><div className="eyebrow">Guardrail</div><h3 style={{ margin: "4px 0 5px", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 500 }}>AI can draft. It cannot decide for you.</h3><p style={{ margin: 0, color: "#5d7168", fontSize: 12, lineHeight: 1.55 }}>PRIS keeps facts, inferences, drafts, and sent messages separate. Every external action remains yours.</p></div><CircleAlert size={16} color="#8aa197" style={{ marginLeft: "auto" }} /></div></div>
    </div>
  </PrisShell>;
}
