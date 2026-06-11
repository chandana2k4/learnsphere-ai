import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Menu, X, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/learn", label: "Learn" },
  { to: "/quiz", label: "Quiz" },
  { to: "/tutor", label: "AI Tutor" },
  { to: "/visual-lab", label: "Visual Lab" },
  { to: "/roadmaps", label: "Roadmaps" },
  { to: "/mentor", label: "Career Mentor" },
  { to: "/revision", label: "Revision" },
  { to: "/profile", label: "Profile" },
] as const;

export function Navbar() {
  const [authed, setAuthed] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <div className="grid h-8 w-8 place-items-center rounded-lg brand-gradient text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="brand-text text-lg" style={{ fontFamily: "var(--font-display)" }}>
            LearnSphere AI
          </span>
        </Link>

        {authed && (
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "rounded-lg px-3 py-1.5 text-sm text-foreground bg-secondary" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {authed ? (
            <button
              onClick={signOut}
              className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground md:inline-flex"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          ) : (
            <>
              <Link to="/auth" className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground md:inline-flex">Sign in</Link>
              <Link to="/auth" className="rounded-lg brand-gradient px-4 py-2 text-sm font-medium text-primary-foreground glow-shadow">Get started</Link>
            </>
          )}
          {authed && (
            <button onClick={() => setOpen(!open)} className="lg:hidden rounded-lg border border-border p-2" aria-label="Menu">
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {open && authed && (
        <div className="border-t border-border lg:hidden">
          <nav className="mx-auto grid max-w-7xl grid-cols-2 gap-1 p-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "rounded-lg px-3 py-2 text-sm bg-secondary text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
            <button onClick={signOut} className="col-span-2 mt-1 rounded-lg border border-border px-3 py-2 text-sm">
              Sign out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
