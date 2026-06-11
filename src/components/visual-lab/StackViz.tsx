import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { motion, AnimatePresence } from "framer-motion";

export function StackViz() {
  const [stack, setStack] = useState<number[]>([10, 22, 7]);
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<string>("");

  function push() {
    const v = Number(value);
    if (Number.isNaN(v)) return;
    setStack((s) => [...s, v]);
    setValue("");
    setMsg(`push(${v})`);
  }
  function pop() {
    setStack((s) => {
      if (!s.length) return s;
      setMsg(`pop() → ${s[s.length - 1]}`);
      return s.slice(0, -1);
    });
  }
  function peek() {
    if (!stack.length) return setMsg("Stack is empty");
    setMsg(`peek() → ${stack[stack.length - 1]}`);
  }

  return (
    <GlassCard>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" className="w-32 rounded-lg border border-border bg-background/40 px-3 py-2 text-sm outline-none" />
        <Btn onClick={push}>Push</Btn>
        <Btn onClick={pop} variant="outline">Pop</Btn>
        <Btn onClick={peek} variant="outline">Peek</Btn>
        <span className="ml-auto text-xs text-muted-foreground">LIFO · last in, first out</span>
      </div>

      <div className="relative mx-auto flex h-80 w-48 flex-col-reverse items-stretch justify-start gap-2 rounded-b-xl border-x-2 border-b-2 border-border bg-background/30 p-3">
        <AnimatePresence>
          {stack.map((v, i) => (
            <motion.div
              key={i + "-" + v}
              layout
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className="grid h-10 place-items-center rounded-lg brand-gradient text-sm font-semibold text-primary-foreground"
            >
              {v}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <p className="mt-3 text-center text-sm text-accent">{msg}</p>
    </GlassCard>
  );
}

export function Btn({ children, onClick, variant = "primary" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "outline" }) {
  return (
    <button onClick={onClick} className={variant === "primary"
      ? "rounded-lg brand-gradient px-3 py-2 text-sm font-medium text-primary-foreground"
      : "rounded-lg border border-border bg-background/30 px-3 py-2 text-sm hover:border-foreground/30"
    }>{children}</button>
  );
}
