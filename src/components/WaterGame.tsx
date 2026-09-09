import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CELL_SIZE,
  COLS,
  ROWS,
  GOAL_INDEX,
  GOAL_MOUTH,
  LEVELS,
  OPENING_POCKETS,
  SOURCE_INDEX,
  solidCells,
  type Level,
} from "@/lib/levels";
import { quoteForLevel } from "@/lib/quotes";
import jerryCanYellow from "@/assets/jerry-can-yellow.png.asset.json";

const BRUSH_R = 27;
const TICK_MS = 180;
const FILL_PER_TICK = 14;

const SOLID = solidCells();
const MOUTH = new Set(GOAL_MOUTH);

type FlowState = "moving" | "waiting" | "full";

function createSoil(rockCells: Set<number>) {
  const soil = new Set<number>();
  for (let row = 1; row < ROWS; row += 1) {
    for (let column = 0; column < COLS; column += 1) {
      const index = row * COLS + column;
      if (
        index !== SOURCE_INDEX &&
        index !== GOAL_INDEX &&
        !OPENING_POCKETS.includes(index) &&
        !rockCells.has(index) &&
        !SOLID.has(index)
      ) {
        soil.add(index);
      }
    }
  }
  return soil;
}

interface WaterGameProps {
  levelIndex: number;
  onSelectLevel: (index: number) => void;
}

export function WaterGame({ levelIndex, onSelectLevel }: WaterGameProps) {
  const level: Level = LEVELS[levelIndex]!;
  const rockCells = useMemo(() => new Set(level.rocks.map(([c, r]) => r * COLS + c)), [level]);

  const [soilCells, setSoilCells] = useState<Set<number>>(() => createSoil(rockCells));
  const [waterTrail, setWaterTrail] = useState<number[]>([SOURCE_INDEX]);
  const [waterFront, setWaterFront] = useState<number[]>([SOURCE_INDEX]);
  const [cursorPoint, setCursorPoint] = useState<{ x: number; y: number } | null>(null);
  const [fill, setFill] = useState(0);
  const [status, setStatus] = useState<FlowState>("moving");
  const [solved, setSolved] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const soilRef = useRef<Set<number>>(soilCells);
  const rockRef = useRef<Set<number>>(rockCells);
  const trailRef = useRef<Set<number>>(new Set([SOURCE_INDEX]));
  const frontRef = useRef<number[]>([SOURCE_INDEX]);
  const fillRef = useRef(0);
  const solvedRef = useRef(false);
  const drawingRef = useRef(false);
  soilRef.current = soilCells;
  rockRef.current = rockCells;

  const reset = useCallback(() => {
    const nextSoil = createSoil(rockRef.current);
    soilRef.current = nextSoil;
    trailRef.current = new Set([SOURCE_INDEX]);
    frontRef.current = [SOURCE_INDEX];
    fillRef.current = 0;
    solvedRef.current = false;
    setSoilCells(nextSoil);
    setWaterTrail([SOURCE_INDEX]);
    setWaterFront([SOURCE_INDEX]);
    setCursorPoint(null);
    setFill(0);
    setStatus("moving");
    setSolved(false);
  }, []);

  useEffect(() => {
    reset();
  }, [reset, levelIndex]);

  // R restarts the level
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "r") reset();
      if (e.key === "Escape") setHowToOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reset]);

  // Water simulation — the original front-based falling water, with a fixed goal.
  useEffect(() => {
    const getNeighbors = (index: number) => {
      const column = index % COLS;
      const row = Math.floor(index / COLS);
      const candidates: [number, number][] = [
        [column, row + 1],
        [column - 1, row + 1],
        [column + 1, row + 1],
        [column - 1, row],
        [column + 1, row],
      ];
      return candidates
        .filter(([c, r]) => c >= 0 && c < COLS && r >= 0 && r < ROWS)
        .map(([c, r]) => r * COLS + c);
    };

    const timer = window.setInterval(() => {
      if (solvedRef.current) return;

      const nextFront: number[] = [];
      const occupied = new Set<number>();

      for (const index of frontRef.current) {
        const neighbors = getNeighbors(index).filter(
          (candidate) =>
            !soilRef.current.has(candidate) &&
            !rockRef.current.has(candidate) &&
            !SOLID.has(candidate) &&
            !trailRef.current.has(candidate),
        );
        const currentRow = Math.floor(index / COLS);
        const falling = neighbors.filter((c) => Math.floor(c / COLS) > currentRow);
        const nextCandidates = falling.length
          ? falling.slice(0, 1)
          : neighbors.slice(0, 2);

        if (!nextCandidates.length) {
          nextFront.push(index);
          occupied.add(index);
          continue;
        }
        for (const next of nextCandidates) {
          if (occupied.has(next)) continue;
          nextFront.push(next);
          occupied.add(next);
          trailRef.current.add(next);
        }
      }

      // Fixed finish line: water touching the can's mouth fills it.
      let touching = false;
      for (const m of MOUTH) {
        if (trailRef.current.has(m) || nextFront.includes(m)) {
          touching = true;
          break;
        }
      }

      if (touching) {
        fillRef.current = Math.min(100, fillRef.current + FILL_PER_TICK);
        setFill(fillRef.current);
        if (fillRef.current >= 100) {
          solvedRef.current = true;
          setSolved(true);
          setStatus("full");
        } else {
          setStatus("full");
        }
      } else {
        const moving = nextFront.some((index, pos) => index !== frontRef.current[pos]);
        setStatus(moving ? "moving" : "waiting");
      }

      frontRef.current = nextFront;
      setWaterFront(nextFront);
      setWaterTrail(Array.from(trailRef.current));
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, []);

  const getPoint = useCallback((e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(CANVAS_WIDTH, ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH)),
      y: Math.max(0, Math.min(CANVAS_HEIGHT, ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT)),
    };
  }, []);

  const carveAt = useCallback((point: { x: number; y: number }) => {
    if (solvedRef.current) return;
    const minColumn = Math.max(0, Math.floor((point.x - BRUSH_R) / CELL_SIZE));
    const maxColumn = Math.min(COLS - 1, Math.floor((point.x + BRUSH_R) / CELL_SIZE));
    const minRow = Math.max(1, Math.floor((point.y - BRUSH_R) / CELL_SIZE));
    const maxRow = Math.min(ROWS - 1, Math.floor((point.y + BRUSH_R) / CELL_SIZE));
    let changed = false;
    const nextSoil = new Set(soilRef.current);
    for (let row = minRow; row <= maxRow; row += 1) {
      for (let column = minColumn; column <= maxColumn; column += 1) {
        const cx = column * CELL_SIZE + CELL_SIZE / 2;
        const cy = row * CELL_SIZE + CELL_SIZE / 2;
        if (Math.hypot(cx - point.x, cy - point.y) <= BRUSH_R) {
          const index = row * COLS + column;
          // Bedrock and the can's footing can never be dug.
          if (!SOLID.has(index) && nextSoil.delete(index)) changed = true;
        }
      }
    }
    if (changed) setSoilCells(nextSoil);
  }, []);

  const cellPoint = (index: number) => ({
    x: (index % COLS) * CELL_SIZE + CELL_SIZE / 2,
    y: Math.floor(index / COLS) * CELL_SIZE + CELL_SIZE / 2,
  });

  const quote = quoteForLevel(levelIndex);
  const nextAvailable = levelIndex < LEVELS.length - 1;
  const canX = 19 * CELL_SIZE;
  const canY = 13 * CELL_SIZE - 10;
  const streamPoints = waterTrail
    .map((index) => {
      const p = cellPoint(index);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  const statusLabel =
    status === "full"
      ? fill >= 100
        ? "Jerry can is full!"
        : "Jerry can is filling…"
      : status === "moving"
        ? "Water is moving"
        : "Water is waiting";

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHowToOpen(true)}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            How to play
          </button>
          <button
            onClick={reset}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Restart <span className="text-muted-foreground">(R)</span>
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex w-full items-center gap-3">
        <img src={jerryCanYellow.url} alt="Jerry can" className="h-8 w-auto" />
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-water transition-all duration-200"
            style={{ width: `${fill}%` }}
          />
        </div>
        <span className="text-xs font-bold text-muted-foreground">
          {statusLabel}
        </span>
      </div>

      {/* Play field */}
      <div className="relative w-full overflow-hidden rounded-2xl border-4 border-ink bg-card shadow-xl">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="block w-full touch-none select-none"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.97 0.02 95) 0%, oklch(0.93 0.04 85) 100%)",
          }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drawingRef.current = true;
            const p = getPoint(e);
            if (p) {
              setCursorPoint(p);
              carveAt(p);
            }
          }}
          onPointerMove={(e) => {
            const p = getPoint(e);
            if (!p) return;
            setCursorPoint(p);
            if (drawingRef.current) carveAt(p);
          }}
          onPointerUp={() => {
            drawingRef.current = false;
          }}
          onPointerLeave={() => {
            drawingRef.current = false;
            setCursorPoint(null);
          }}
        >
          {/* Water stream */}
          {waterTrail.length > 1 && (
            <polyline
              points={streamPoints}
              className="fill-none stroke-water"
              strokeWidth={10}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.45}
            />
          )}
          {waterTrail.map((index) => {
            const p = cellPoint(index);
            return (
              <circle
                key={`t${index}`}
                cx={p.x}
                cy={p.y}
                r={9}
                className="fill-water"
                opacity={0.75}
              />
            );
          })}
          {waterFront.map((index, i) => {
            const p = cellPoint(index);
            return (
              <circle key={`f${i}`} cx={p.x} cy={p.y} r={12} className="fill-water" />
            );
          })}

          {/* Soil */}
          {Array.from(soilCells).map((index) => {
            const column = index % COLS;
            const row = Math.floor(index / COLS);
            return (
              <g key={`s${index}`}>
                <rect
                  x={column * CELL_SIZE}
                  y={row * CELL_SIZE}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  className={(column + row) % 2 === 0 ? "fill-dirt" : "fill-dirt-dark"}
                />
                {(column + row) % 3 === 0 && (
                  <circle
                    cx={column * CELL_SIZE + CELL_SIZE * 0.3}
                    cy={row * CELL_SIZE + CELL_SIZE * 0.35}
                    r={2}
                    className="fill-dirt-dark"
                    opacity={0.6}
                  />
                )}
              </g>
            );
          })}

          {/* Rocks */}
          {Array.from(rockCells).map((index) => {
            const column = index % COLS;
            const row = Math.floor(index / COLS);
            return (
              <rect
                key={`r${index}`}
                x={column * CELL_SIZE + 1}
                y={row * CELL_SIZE + 1}
                width={CELL_SIZE - 2}
                height={CELL_SIZE - 2}
                rx={7}
                className="fill-rock"
              />
            );
          })}

          {/* Bedrock footing under the jerry can */}
          {Array.from(SOLID).map((index) => {
            const column = index % COLS;
            const row = Math.floor(index / COLS);
            return (
              <rect
                key={`b${index}`}
                x={column * CELL_SIZE}
                y={row * CELL_SIZE}
                width={CELL_SIZE}
                height={CELL_SIZE}
                className="fill-bedrock"
              />
            );
          })}

          {/* Source */}
          <rect
            x={2 * CELL_SIZE - 10}
            y={1 * CELL_SIZE - 22}
            width={CELL_SIZE + 20}
            height={20}
            rx={7}
            className="fill-rock"
          />
          <text
            x={2 * CELL_SIZE + CELL_SIZE / 2}
            y={1 * CELL_SIZE - 28}
            textAnchor="middle"
            className="fill-ink"
            style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2 }}
          >
            WATER SOURCE
          </text>

          {/* Jerry can finish goal */}
          <image
            href={jerryCanYellow.url}
            x={canX}
            y={canY}
            width={3.4 * CELL_SIZE}
            height={Math.round(3.4 * CELL_SIZE * (226 / 163))}
            preserveAspectRatio="xMidYMax meet"
          />
          <text
            x={21 * CELL_SIZE + CELL_SIZE / 2}
            y={13 * CELL_SIZE - 18}
            textAnchor="middle"
            className="fill-ink"
            style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2 }}
          >
            JERRY CAN
          </text>

          {/* Cursor ring */}
          {cursorPoint && !solved && (
            <circle
              cx={cursorPoint.x}
              cy={cursorPoint.y}
              r={BRUSH_R}
              className="fill-none stroke-ink"
              strokeWidth={2}
              strokeDasharray="6 6"
              style={{ pointerEvents: "none" }}
            />
          )}
        </svg>

        {/* Win overlay */}
        {solved && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/70 p-6">
            <div className="w-full max-w-md rounded-2xl bg-card p-8 text-center shadow-2xl">
              <img
                src={jerryCanYellow.url}
                alt="Full jerry can"
                className="mx-auto h-24 w-auto"
              />
              <h3 className="mt-3 font-display text-3xl font-extrabold text-foreground">
                That water found its way.
              </h3>
              <blockquote className="mt-4 text-lg font-semibold text-foreground">
                “{quote.text}”
              </blockquote>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                — {quote.attribution}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={reset}
                  className="rounded-full border border-border px-5 py-2 text-sm font-bold text-foreground transition-colors hover:bg-accent"
                >
                  Try this level again
                </button>
                {nextAvailable ? (
                  <button
                    onClick={() => onSelectLevel(levelIndex + 1)}
                    className="rounded-full bg-brand px-5 py-2 text-sm font-extrabold text-brand-foreground transition-transform hover:scale-105"
                  >
                    Level {levelIndex + 2} →
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
        Drag through the soil to open a channel. Water falls with gravity toward
        the yellow jerry can — grey rock and the dark bedrock footing can't be
        dug, so every drop that reaches the can counts.
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

      {/* How to play modal */}
      {howToOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
          onClick={() => setHowToOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-card p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-display text-2xl font-extrabold text-foreground">
                How to play
              </h3>
              <button
                onClick={() => setHowToOpen(false)}
                aria-label="Close"
                className="rounded-full border border-border px-3 py-1 text-sm font-bold text-foreground hover:bg-accent"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Open a channel through the soil and watch clean water find its way
              to the yellow jerry can.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-foreground">
              <li>
                <strong>Drag to dig.</strong> Press and drag with a mouse or
                finger. The ring removes only the soil it touches.
              </li>
              <li>
                <strong>Watch the water.</strong> Blue water falls, spreads, and
                waits when it meets dirt.
              </li>
              <li>
                <strong>Find the can.</strong> Open a connected route all the
                way to the jerry can. Rocks and bedrock stay put.
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Shortcuts: R restarts the level · Esc closes this panel
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
