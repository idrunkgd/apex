"use client";
import { useEffect, useRef, useState } from "react";

export function SignaturePad({ name, onChange }: { name: string; onChange?: (hasSignature: boolean) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenRef = useRef<HTMLInputElement | null>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.strokeStyle = "#ff5a00";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function pos(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function start(e: React.PointerEvent) {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    canvasRef.current!.setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setEmpty(false);
  }
  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    if (hiddenRef.current) hiddenRef.current.value = canvasRef.current!.toDataURL("image/png");
    onChange?.(true);
  }
  function clear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (hiddenRef.current) hiddenRef.current.value = "";
    setEmpty(true);
    onChange?.(false);
  }

  return (
    <div>
      <input type="hidden" name={name} ref={hiddenRef} />
      <div className="relative border border-edge rounded-md bg-white/95">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="w-full h-40 touch-none rounded-md cursor-crosshair"
        />
        {empty && (
          <span className="absolute inset-0 flex items-center justify-center text-gris/70 font-cond text-sm pointer-events-none">
            Signez ici
          </span>
        )}
      </div>
      <button type="button" onClick={clear} className="mt-2 font-cond text-xs tracking-wide uppercase text-gris hover:text-orange transition-colors">
        Effacer
      </button>
    </div>
  );
}
