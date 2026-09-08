import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  COLS,
  ROWS,
  LEVELS,
  MOUTH_CELLS,
  SOURCE_CELLS,
  solidCells,
  type Level,
} from "@/lib/levels";
import { quoteForLevel } from "@/lib/quotes";
import jerryCanYellow from "@/assets/jerry-can-yellow.png.asset.json";

const W = 720;
const H = 480;
const CELL = W / COLS; // 30
const BRUSH_R = 27;
const FILL_PER_TICK = 9;
const TICK_MS = 180;

const SOLID = solidCells();
const MOUTH = new Set(MOUTH_CELLS);

interface WaterGameProps {
  levelIndex: number;
  onSelectLevel: (index: number) => void;
}

export function WaterGame({ levelIndex, onSelectLevel }: WaterGameProps) {
  const level: Level = LEVELS[levelIndex];
  const rocks = useMemo(() => {
    const s = new Set<number>();
    for (const [c, r] of level.rocks) s.add(r * COLS + c);
    return s;
  }, [level]);

  const initialSoil = useCallback(() => {
    const s = new Set<number>();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const id = r * COLS + c;
        if (rocks.has(id) || SOLID.has(id)) continue;
        if (r === 0 && SOURCE_CELLS.includes(c)) continue; // source starts open
        s.add(id);
      }
    }
    return s;
  }, [rocks]);

  const [soil, setSoil] = useState<Set<number>>(initialSoil);
  const [water, setWater] = useState<Set<number>>(new Set());
  const [fill, setFill] = useState(0);
  const [won, setWon] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const soilRef = useRef(soil);
  const fillRef = useRef(0);
  const wonRef = useRef(false);
  const diggingRef = useRef(false);
  const cursorRef = useRef<SVGCircleElement>(null);
  soilRef.current = soil;

  const restart = useCallback(() => {
    setSoil(initialSoil());
    setWater(new Set());
    setFill(0);
    setWon(false);
    fillRef.current = 0;
    wonRef.current = false;
  }, [initialSoil]);

  // Reset whenever the level changes
  useEffect(() => {
    restart();
  }, [restart, levelIndex]);

  // Water simulation: flood-fill from the source through dug cells.
  useEffect(() => {
    const tick = () => {
      const open = (id: number) =>
        !soilRef.current.has(id) && !rocks.has(id) && !SOLID.has(id);
      const seen = new Set<number>();
      const queue: number[] = [];
      for (const c of SOURCE_CELLS) {
        const id = c; // row 0
        if (open(id)) {
          seen.add(id);
          queue.push(id);
        }
      }
      while (queue.length) {
        const id = queue.pop()!;
        const r = Math.floor(id / COLS);
        const c = id % COLS;
        const neighbors = [
          r + 1 < ROWS ? id + COLS : -1, // down
          c > 0 ? id - 1 : -1, // left
          c < COLS - 1 ? id + 1 : -1, // right
          r > 0 ? id - COLS : -1, // up (fills dug basins)
        ];
        for (const n of neighbors) {
          if (n >= 0 && !seen.has(n) && open(n)) {
            seen.add(n);
            queue.push(n);
          }
        }
      }
      setWater(seen);

      // Win check: water touching the jerry can mouth fills it.
      if (!wonRef.current) {
        let touching = false;
        for (const m of MOUTH) {
          if (seen.has(m)) {
            touching = true;
            break;
          }
        }
        if (touching) {
          fillRef.current = Math.min(100, fillRef.current + FILL_PER_TICK);
          setFill(fillRef.current);
          if (fillRef.current >= 100) {
            wonRef.current = true;
            setWon(true);
          }
        }
      }
    };
    const timer = setInterval(tick, TICK_MS);
    return () => clearInterval(timer);
  }, [rocks]);

  const toLocal = useCallback((e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(W, ((e.clientX - rect.left) / rect.width) * W)),
      y: Math.max(0, Math.min(H, ((e.clientY - rect.top) / rect.height) * H)),
    };
  }, []);

  const digAt = useCallback(
    (x: number, y: number) => {
      if (wonRef.current) return;
      const next = new Set(soilRef.current);
      let changed = false;
      const c0 = Math.max(0, Math.floor((x - BRUSH_R) / CELL));
      const c1 = Math.min(COLS - 1, Math.floor((x + BRUSH_R) / CELL));
      const r0 = Math.max(0, Math.floor((y - BRUSH_R) / CELL));
      const r1 = Math.min(ROWS - 1, Math.floor((y + BRUSH_R) / CELL));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const cx = c * CELL + CELL / 2;
          const cy = r * CELL + CELL / 2;
          if (Math.hypot(cx - x, cy - y) <= BRUSH_R) {
            const id = r * COLS + c;
            if (next.delete(id)) changed = true;
          }
        }
      }
      if (changed) setSoil(next);
    },
    [],
  );

  const moveCursor = useCallback(
    (x: number, y: number, visible: boolean) => {
      const el = cursorRef.current;
      if (!el) return;
      el.setAttribute("cx", String(x));
      el.setAttribute("cy", String(y));
      el.style.display = visible ? "block" : "none";
    },
    [],
  );

  const quote = quoteForLevel(levelIndex);
  const nextAvailable = levelIndex < LEVELS.length - 1;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      {/* Level header */}
      <div className="flex w-full flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Level {levelIndex + 1} of {LEVELS.length}
          </p>
          <h2 className="font-display text-2xl font-extrabold text-foreground">
            {level.title}
          </h2>
          <p className="text-sm text-muted-foreground">{level.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Fill meter */}
          <div className="flex items-center gap-2">
            <img src={jerryCanYellow.url} alt="Jerry can" className="h-8 w-auto" />
            <div className="h-3 w-28 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-water transition-all duration-200"
                style={{ width: `${fill}%` }}
              />
            </div>
            <span className="w-10 text-xs font-bold text-muted-foreground">
              {fill}%
            </span>
          </div>
          <button
            onClick={restart}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Restart
          </button>
        </div>
      </div>

      {/* Play field */}
      <div className="relative w-full overflow-hidden rounded-2xl border-4 border-ink shadow-xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full touch-none select-none"
          style={{ background: "linear-gradient(180deg, oklch(0.97 0.02 95) 0%, oklch(0.93 0.04 85) 100%)" }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            diggingRef.current = true;
            const p = toLocal(e);
            if (p) {
              digAt(p.x, p.y);
              moveCursor(p.x, p.y, true);
            }
          }}
          onPointerMove={(e) => {
            const p = toLocal(e);
            if (!p) return;
            moveCursor(p.x, p.y, true);
            if (diggingRef.current) digAt(p.x, p.y);
          }}
          onPointerUp={() => {
            diggingRef.current = false;
          }}
          onPointerLeave={() => {
            diggingRef.current = false;
            moveCursor(0, 0, false);
          }}
        >
          {/* Soil */}
          {Array.from(soil).map((id) => {
            const r = Math.floor(id / COLS);
            const c = id % COLS;
            return (
              <rect
                key={`s${id}`}
                x={c * CELL}
                y={r * CELL}
                width={CELL}
                height={CELL}
                className={(r + c) % 2 === 0 ? "fill-dirt" : "fill-dirt-dark"}
              />
            );
          })}

          {/* Rocks */}
          {Array.from(rocks).map((id) => {
            const r = Math.floor(id / COLS);
            const c = id % COLS;
            return (
              <rect
                key={`r${id}`}
                x={c * CELL + 1}
                y={r * CELL + 1}
                width={CELL - 2}
                height={CELL - 2}
                rx={6}
                className="fill-rock"
              />
            );
          })}

          {/* Bedrock floor */}
          {Array.from({ length: COLS }, (_, c) => (
            <rect
              key={`b${c}`}
              x={c * CELL}
              y={15 * CELL}
              width={CELL}
              height={CELL}
              className="fill-bedrock"
            />
          ))}

          {/* Water */}
          {Array.from(water).map((id) => {
            const r = Math.floor(id / COLS);
            const c = id % COLS;
            return (
              <rect
                key={`w${id}`}
                x={c * CELL}
                y={r * CELL}
                width={CELL}
                height={CELL}
                className="fill-water opacity-90"
              />
            );
          })}

          {/* Source pipe */}
          <rect x={11 * CELL - 6} y={-4} width={2 * CELL + 12} height={18} rx={6} className="fill-rock" />
          <text
            x={12 * CELL}
            y={34}
            textAnchor="middle"
            className="fill-ink"
            style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2 }}
          >
            WATER SOURCE
          </text>

          {/* Jerry can (finish) — solid, cannot be dug through */}
          <image
            href={jerryCanYellow.url}
            x={10 * CELL}
            y={13 * CELL - 22}
            width={4 * CELL}
            height={Math.round(4 * CELL * (226 / 163))}
            preserveAspectRatio="xMidYMax meet"
          />
          <text
            x={12 * CELL}
            y={13 * CELL - 30}
            textAnchor="middle"
            className="fill-ink"
            style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2 }}
          >
            JERRY CAN
          </text>

          {/* Dig cursor */}
          <circle
            ref={cursorRef}
            r={BRUSH_R}
            className="fill-none stroke-ink"
            strokeWidth={2}
            strokeDasharray="6 6"
            style={{ display: "none", pointerEvents: "none" }}
          />
        </svg>

        {/* Win overlay */}
        {won && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/70 p-6">
            <div className="w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-2xl">
              <img
                src={jerryCanYellow.url}
                alt="Full jerry can"
                className="mx-auto h-24 w-auto"
              />
              <h3 className="mt-3 font-display text-3xl font-extrabold text-foreground">
                Jerry can filled!
              </h3>
              <blockquote className="mt-4 text-lg font-semibold text-foreground">
                “{quote.text}”
              </blockquote>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                — {quote.attribution}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={restart}
                  className="rounded-full border border-border px-5 py-2 text-sm font-bold text-foreground transition-colors hover:bg-accent"
                >
                  Play again
                </button>
                {nextAvailable ? (
                  <button
                    onClick={() => onSelectLevel(levelIndex + 1)}
                    className="rounded-full bg-brand px-5 py-2 text-sm font-extrabold text-brand-foreground transition-transform hover:scale-105"
                  >
                    Next level →
                  </button>
                ) : (
                  <a
                    href="https://www.charitywater.org/donate"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-brand px-5 py-2 text-sm font-extrabold text-brand-foreground transition-transform hover:scale-105"
                  >
                    You beat every level — donate ♥
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Drag to dig a channel from the source to the jerry can. Grey rocks and
        the dark bedrock can't be dug — the can is solid, so every drop that
        reaches it counts.
      </p>

      {/* Level select */}
      <div className="flex flex-wrap justify-center gap-2">
        {LEVELS.map((l, i) => (
          <button
            key={l.title}
            onClick={() => onSelectLevel(i)}
            aria-label={`Level ${i + 1}: ${l.title}`}
            className={
              i === levelIndex
                ? "h-9 w-9 rounded-full bg-brand text-sm font-extrabold text-brand-foreground"
                : "h-9 w-9 rounded-full border border-border text-sm font-bold text-muted-foreground transition-colors hover:bg-accent"
            }
          >
            {i + 1}
          </button>
        ))}
      </div>

      <Link
        to="/"
        className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
      >
        ← Back to start
      </Link>
    </div>
  );
}
