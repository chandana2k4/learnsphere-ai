import { useEffect, useRef, useState } from "react";
import { GlassCard } from "@/components/GlassCard";

export function PendulumViz() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [length, setLength] = useState(180);
  const [gravity, setGravity] = useState(9.8);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let theta = Math.PI / 4;
    let omega = 0;
    let raf = 0;
    let last = performance.now();
    const draw = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      if (running) {
        const alpha = (-gravity / (length / 60)) * Math.sin(theta);
        omega += alpha * dt;
        omega *= 0.999;
        theta += omega * dt;
      }
      const w = canvas.width = canvas.clientWidth;
      const h = canvas.height = 360;
      ctx.clearRect(0, 0, w, h);
      const px = w / 2;
      const py = 30;
      const bx = px + length * Math.sin(theta);
      const by = py + length * Math.cos(theta);

      // string
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
      // pivot
      ctx.fillStyle = "#aaa"; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
      // bob
      const grad = ctx.createRadialGradient(bx, by, 4, bx, by, 24);
      grad.addColorStop(0, "oklch(0.78 0.16 200)");
      grad.addColorStop(1, "oklch(0.45 0.2 275)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(bx, by, 22, 0, Math.PI * 2); ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [length, gravity, running]);

  return (
    <GlassCard>
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <label>Length <input type="range" min={60} max={260} value={length} onChange={(e) => setLength(Number(e.target.value))} /></label>
        <label>Gravity <input type="range" min={1} max={25} step={0.1} value={gravity} onChange={(e) => setGravity(Number(e.target.value))} /> {gravity.toFixed(1)} m/s²</label>
        <button onClick={() => setRunning((r) => !r)} className="ml-auto rounded-lg border border-border px-3 py-1.5">{running ? "Pause" : "Play"}</button>
      </div>
      <canvas ref={ref} className="w-full rounded-xl border border-border bg-background/30" />
    </GlassCard>
  );
}
