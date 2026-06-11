import { useEffect, useRef, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Btn } from "./StackViz";

type Algo = "bubble" | "selection" | "insertion" | "merge" | "quick";

export function SortingViz() {
  const [arr, setArr] = useState<number[]>(() => randArr(24));
  const [algo, setAlgo] = useState<Algo>("bubble");
  const [running, setRunning] = useState(false);
  const [highlight, setHighlight] = useState<[number, number]>([-1, -1]);
  const [speed, setSpeed] = useState(35);
  const stopRef = useRef(false);

  useEffect(() => () => { stopRef.current = true; }, []);

  function reset() { stopRef.current = false; setArr(randArr(24)); setHighlight([-1, -1]); }

  async function run() {
    if (running) return;
    setRunning(true); stopRef.current = false;
    const a = [...arr];
    const wait = () => new Promise((r) => setTimeout(r, speed));
    const setStep = async (i: number, j: number) => { if (stopRef.current) throw "stop"; setHighlight([i, j]); setArr([...a]); await wait(); };
    try {
      if (algo === "bubble") {
        for (let i = 0; i < a.length; i++)
          for (let j = 0; j < a.length - i - 1; j++) {
            await setStep(j, j + 1);
            if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
          }
      } else if (algo === "selection") {
        for (let i = 0; i < a.length; i++) {
          let m = i;
          for (let j = i + 1; j < a.length; j++) { await setStep(m, j); if (a[j] < a[m]) m = j; }
          [a[i], a[m]] = [a[m], a[i]];
        }
      } else if (algo === "insertion") {
        for (let i = 1; i < a.length; i++) {
          let j = i;
          while (j > 0 && a[j - 1] > a[j]) { await setStep(j - 1, j); [a[j - 1], a[j]] = [a[j], a[j - 1]]; j--; }
        }
      } else if (algo === "merge") {
        async function ms(l: number, r: number): Promise<void> {
          if (r - l <= 1) return;
          const m = Math.floor((l + r) / 2);
          await ms(l, m); await ms(m, r);
          const tmp: number[] = []; let i = l, j = m;
          while (i < m && j < r) { await setStep(i, j); if (a[i] <= a[j]) tmp.push(a[i++]); else tmp.push(a[j++]); }
          while (i < m) tmp.push(a[i++]); while (j < r) tmp.push(a[j++]);
          for (let k = 0; k < tmp.length; k++) { a[l + k] = tmp[k]; await setStep(l + k, l + k); }
        }
        await ms(0, a.length);
      } else if (algo === "quick") {
        async function qs(l: number, r: number): Promise<void> {
          if (l >= r) return;
          const p = a[r]; let i = l;
          for (let j = l; j < r; j++) { await setStep(j, r); if (a[j] < p) { [a[i], a[j]] = [a[j], a[i]]; i++; } }
          [a[i], a[r]] = [a[r], a[i]];
          await qs(l, i - 1); await qs(i + 1, r);
        }
        await qs(0, a.length - 1);
      }
      setHighlight([-1, -1]);
    } catch { /* stopped */ }
    setRunning(false);
  }

  const max = Math.max(...arr);
  return (
    <GlassCard>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select value={algo} onChange={(e) => setAlgo(e.target.value as Algo)} className="rounded-lg border border-border bg-background/40 px-3 py-2 text-sm">
          <option value="bubble">Bubble Sort</option>
          <option value="selection">Selection Sort</option>
          <option value="insertion">Insertion Sort</option>
          <option value="merge">Merge Sort</option>
          <option value="quick">Quick Sort</option>
        </select>
        <Btn onClick={run}>{running ? "Running…" : "Run"}</Btn>
        <Btn onClick={() => { stopRef.current = true; setRunning(false); }} variant="outline">Stop</Btn>
        <Btn onClick={reset} variant="outline">Shuffle</Btn>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          Speed
          <input type="range" min={5} max={120} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        </div>
      </div>
      <div className="flex h-72 items-end gap-1 rounded-xl border border-border bg-background/30 p-3">
        {arr.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-t"
            style={{
              height: `${(v / max) * 100}%`,
              background: i === highlight[0] || i === highlight[1] ? "oklch(0.78 0.16 200)" : "oklch(0.65 0.22 275)",
              transition: "background 0.1s",
            }}
          />
        ))}
      </div>
    </GlassCard>
  );
}

function randArr(n: number) { return Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10); }
