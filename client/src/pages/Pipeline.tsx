import PrisShell, { EmptyState, SectionHeading } from "@/components/PrisShell";
import { stateShort } from "@/lib/app";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Network } from "lucide-react";
import { Link } from "wouter";

const lanes = ["Research Pending", "Ready to Connect", "Connected", "Acknowledged", "Conversational", "Shared Relevance", "Developing Relationship", "Opportunity Discussion", "Maintenance"];

export default function Pipeline() {
  const contacts = trpc.contacts.list.useQuery().data ?? [];
  return <PrisShell eyebrow="Relationship state" title="Pipeline" description="A visual memory aid, not a funnel. Relationships can pause, move sideways, or end naturally."><div className="panel panel-pad"><SectionHeading eyebrow="Current map" title="Where each relationship stands" note="State is separate from conversational openness and opportunity signal." /><div className="lane-board">{lanes.map(lane => { const rows = contacts.filter(contact => contact.relationshipState === lane); return <div className="lane" key={lane}><div className="lane-head"><strong>{stateShort[lane]}</strong><span>{rows.length}</span></div><div className="lane-cards">{rows.length ? rows.map(contact => <Link className="lane-card" href={`/contacts/${contact.id}`} key={contact.id}><strong>{contact.displayName}</strong><span>{[contact.currentRole, contact.organization].filter(Boolean).join(" · ") || "Context pending"}</span></Link>) : <div style={{ color: "#95a19b", fontSize: 10, padding: "11px 3px" }}>No records here</div>}</div></div>; })}</div></div><div className="panel panel-pad" style={{ marginTop: 18 }}><EmptyState title="Use the pipeline as a pause point" body="A high level of conversational openness is evidence from one interaction, not a permanent relationship score. Open a contact to review the evidence before changing state." action={<Link href="/contacts" className="button small"><Network size={14} /> Open contacts</Link>} /></div></PrisShell>;
}
