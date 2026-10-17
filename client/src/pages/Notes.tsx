import PrisShell, { SectionHeading } from "@/components/PrisShell";
import { formatDate } from "@/lib/app";
import { FileText, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Note = { id: string; title: string; body: string; updatedAt: string };
const STORAGE_KEY = "pris-notes";

function loadNotes(): Note[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is Note => Boolean(item && typeof item === "object" && "id" in item && "title" in item && "body" in item && "updatedAt" in item)) : [];
  } catch { return []; }
}

function newNote(): Note { return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title: "Untitled note", body: "", updatedAt: new Date().toISOString() }; }

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [selectedId, setSelectedId] = useState<string | null>(() => loadNotes()[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const selected = notes.find(note => note.id === selectedId) ?? null;
  const filtered = useMemo(() => notes.filter(note => `${note.title} ${note.body}`.toLowerCase().includes(query.toLowerCase())), [notes, query]);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); }, [notes]);

  const updateSelected = (patch: Partial<Note>) => {
    if (!selectedId) return;
    setNotes(current => current.map(note => note.id === selectedId ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note));
  };

  const addNote = () => {
    const note = newNote();
    setNotes(current => [note, ...current]);
    setSelectedId(note.id);
  };

  const removeSelected = () => {
    if (!selected) return;
    const remaining = notes.filter(note => note.id !== selected.id);
    setNotes(remaining);
    setSelectedId(remaining[0]?.id ?? null);
    toast.success("Note removed");
  };

  return <PrisShell eyebrow="Private thinking space" title="Notes" description="Capture the small observations, meeting reflections, and people-context details that should not get lost between conversations." actions={<button className="button primary" onClick={addNote}><Plus size={15} /> New note</button>}>
    <div className="notes-layout">
      <section className="panel notes-list-panel">
        <div className="notes-list-head"><SectionHeading eyebrow="Memory" title="Your notes" note={`${notes.length} ${notes.length === 1 ? "note" : "notes"}, stored privately in this workspace.`} /><div className="search-wrap notes-search"><Search size={15} /><input className="input" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search notes" aria-label="Search notes" /></div></div>
        <div className="notes-list">{filtered.length ? filtered.map(note => <button key={note.id} className={`note-list-item ${note.id === selectedId ? "active" : ""}`} onClick={() => setSelectedId(note.id)}><span className="note-list-icon"><FileText size={15} /></span><span className="note-list-copy"><strong>{note.title || "Untitled note"}</strong><span>{note.body.trim().slice(0, 72) || "No text yet"}</span></span><time>{formatDate(note.updatedAt, { day: "numeric", month: "short" })}</time></button>) : <div className="notes-empty"><FileText size={20} /><p>{notes.length ? "No notes match that search." : "Start with a small observation or reflection."}</p>{!notes.length && <button className="button small" onClick={addNote}>Create a note</button>}</div>}</div>
      </section>
      <section className="panel note-editor-panel">{selected ? <><div className="note-editor-head"><div><div className="eyebrow">Private note</div><p>Autosaved · {formatDate(selected.updatedAt, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</p></div><button className="icon-button" onClick={removeSelected} aria-label="Delete note" title="Delete note"><Trash2 size={16} /></button></div><input className="note-title-input" value={selected.title} onChange={event => updateSelected({ title: event.target.value })} aria-label="Note title" /><textarea className="note-body-editor" value={selected.body} onChange={event => updateSelected({ body: event.target.value })} placeholder="Write what you noticed, learned, or want to remember…" aria-label="Note body" autoFocus /></> : <div className="empty-state"><div className="empty-icon"><FileText size={20} /></div><h3>Your thinking space is ready</h3><p>Keep a lightweight memory alongside your relationship work.</p><button className="button primary" onClick={addNote}><Plus size={15} /> Create a note</button></div>}</section>
    </div>
  </PrisShell>;
}
