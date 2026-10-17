import { useAuth } from "@/_core/hooks/useAuth";
import { initials } from "@/lib/app";
import { startLogin } from "@/const";
import { Bell, BookOpen, BriefcaseBusiness, CalendarClock, ChevronRight, CircleUserRound, FileText, LayoutDashboard, LogOut, Menu, Moon, Network, Search, Settings2, Sun, UsersRound, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: UsersRound },
  { href: "/pipeline", label: "Pipeline", icon: Network },
  { href: "/profile", label: "My profile", icon: CircleUserRound },
  { href: "/projects", label: "Projects", icon: BriefcaseBusiness },
  { href: "/follow-ups", label: "Follow-ups", icon: CalendarClock },
  { href: "/notes", label: "Notes", icon: FileText },
];

export default function PrisShell({ children, eyebrow, title, description, actions }: { children: ReactNode; eyebrow?: string; title?: string; description?: string; actions?: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const { theme, toggleTheme } = useTheme();

  if (loading || !user) {
    return <div className="auth-loading"><div className="mark-mark">P</div><p>Opening your private workspace…</p><button className="button primary" onClick={() => startLogin()}>Sign in</button></div>;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand-lockup"><div className="brand-mark"><span>PR</span></div><div><div className="brand-name">PRIS</div><div className="brand-sub">people & relationship ops</div></div><button className="icon-button mobile-close" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
        <div className="sidebar-rule" />
        <div className="nav-caption">Workspace</div>
        <nav className="nav-stack">
          {nav.map(item => { const Icon = item.icon; const active = item.href === "/" ? location === "/" : location.startsWith(item.href); return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`nav-item ${active ? "active" : ""}`}><Icon size={17} strokeWidth={active ? 2.1 : 1.7} /><span>{item.label}</span>{active && <ChevronRight className="nav-chevron" size={14} />}</Link>; })}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-note"><div className="note-kicker">Operating principle</div><p>AI recommends.<br />You decide. You send.</p></div>
        <div className="sidebar-rule" />
        <Link href="/settings" className={`nav-item compact ${location.startsWith("/settings") ? "active" : ""}`}><Settings2 size={16} /><span>Settings</span></Link>
        <div className="user-chip"><div className="avatar small">{initials(user.name ?? "Atul Raj Prasad")}</div><div className="user-chip-copy"><strong>{user.name ?? "Atul Raj Prasad"}</strong><span>Private workspace</span></div><button className="icon-button" onClick={() => void logout()} aria-label="Sign out"><LogOut size={15} /></button></div>
      </aside>
      {open && <button className="mobile-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}
      <section className="main-column">
        <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="topbar-context"><span className="context-dot" /> People workspace <span className="topbar-separator">/</span> Evidence before outreach</div><div className="topbar-actions"><button className="icon-button" aria-label="Search"><Search size={17} /></button><button className="icon-button" aria-label="Notifications"><Bell size={17} /></button><button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}<span>{theme === "light" ? "Dark" : "Light"}</span></button></div></header>
        <main className="content-wrap">
          {(title || description || actions) && <div className="page-heading"><div><div className="eyebrow">{eyebrow ?? "Professional Relationship Intelligence"}</div>{title && <h1>{title}</h1>}{description && <p>{description}</p>}</div>{actions && <div className="heading-actions">{actions}</div>}</div>}
          {children}
        </main>
      </section>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, note, action }: { eyebrow?: string; title: string; note?: string; action?: ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{note && <p>{note}</p>}</div>{action}</div>;
}

export function MetricCard({ label, value, note, accent }: { label: string; value: string | number; note?: string; accent?: boolean }) {
  return <div className={`metric-card ${accent ? "accent" : ""}`}><div className="metric-label">{label}</div><div className="metric-value">{value}</div>{note && <div className="metric-note">{note}</div>}</div>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><BookOpen size={20} /></div><h3>{title}</h3><p>{body}</p>{action}</div>;
}
