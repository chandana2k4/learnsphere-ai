import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Mail, Lock, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — LearnSphere AI" },
      { name: "description", content: "Sign in or create your LearnSphere AI account." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z
  .object({
    name: z.string().min(2, "Name is too short").max(80),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "At least 6 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", remember: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: (search.redirect as "/dashboard") || "/dashboard" });
    });
  }, [navigate, search.redirect]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "signup") {
        const parsed = signupSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { name: form.name },
            emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
        toast.success("Account created. Welcome!");
        navigate({ to: "/dashboard" });
      } else {
        const parsed = loginSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: (search.redirect as "/dashboard") || "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" />
      <div className="mx-auto grid min-h-screen max-w-6xl place-items-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass card-shadow w-full max-w-md rounded-2xl p-8"
        >
          <a href="/" className="mx-auto mb-6 flex w-fit items-center gap-2 font-semibold">
            <div className="grid h-9 w-9 place-items-center rounded-lg brand-gradient text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="brand-text text-lg" style={{ fontFamily: "var(--font-display)" }}>
              LearnSphere AI
            </span>
          </a>

          <div className="mb-6 grid grid-cols-2 rounded-xl bg-secondary/60 p-1">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`rounded-lg py-2 text-sm font-medium transition ${tab === "login" ? "brand-gradient text-primary-foreground" : "text-muted-foreground"}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`rounded-lg py-2 text-sm font-medium transition ${tab === "signup" ? "brand-gradient text-primary-foreground" : "text-muted-foreground"}`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {tab === "signup" && (
              <Field icon={<UserIcon className="h-4 w-4" />} placeholder="Full name"
                value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            )}
            <Field icon={<Mail className="h-4 w-4" />} type="email" placeholder="Email"
              value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field icon={<Lock className="h-4 w-4" />} type="password" placeholder="Password"
              value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
            {tab === "signup" && (
              <Field icon={<Lock className="h-4 w-4" />} type="password" placeholder="Confirm password"
                value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} />
            )}
            {tab === "login" && (
              <label className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                  className="accent-[oklch(0.65_0.22_275)]"
                /> Remember me
              </label>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl brand-gradient py-3 text-sm font-semibold text-primary-foreground glow-shadow disabled:opacity-60"
            >
              {loading ? "Please wait…" : tab === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our terms & privacy policy.
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function Field({
  icon, value, onChange, placeholder, type = "text",
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">{icon}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background/40 py-3 pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-foreground/25"
      />
    </div>
  );
}
