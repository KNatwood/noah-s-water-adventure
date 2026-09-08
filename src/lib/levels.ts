export interface Level {
  title: string;
  subtitle: string;
  /** [col, row] rock positions. col 0-23, row 0-15 */
  rocks: [number, number][];
}

export const COLS = 24;
export const ROWS = 16;
export const CANVAS_WIDTH = 720;
export const CANVAS_HEIGHT = 500;
export const CELL_SIZE = CANVAS_WIDTH / COLS;

export const SOURCE_CELL = { column: 2, row: 1 };
export const GOAL_CELL = { column: 21, row: 13 };
export const SOURCE_INDEX = SOURCE_CELL.row * COLS + SOURCE_CELL.column;
export const GOAL_INDEX = GOAL_CELL.row * COLS + GOAL_CELL.column;

/** Pre-opened pockets from the original game. */
export const OPENING_POCKETS = [
  [5, 3],
  [11, 6],
  [16, 4],
  [18, 10],
  [8, 12],
].map(([column, row]) => row * COLS + column);

/**
 * Finish-line fix: the two rows beneath and beside the jerry can are solid
 * bedrock. Water can no longer be drained past the goal by digging through
 * the finish line — the can sits on stone, and any water that reaches the
 * mouth is captured.
 */
export function solidCells(): Set<number> {
  const s = new Set<number>();
  for (const c of [19, 20, 21, 22, 23]) {
    s.add(14 * COLS + c);
    s.add(15 * COLS + c);
  }
  return s;
}

/** Water touching any of these cells counts as reaching the jerry can. */
export const GOAL_MOUTH: number[] = [
  GOAL_INDEX,
  GOAL_INDEX - 1, // left
  GOAL_INDEX + 1, // right
  GOAL_INDEX - COLS, // above
];

export const LEVELS: Level[] = [
  {
    title: "Make water a way",
    subtitle: "Open the soil one touch at a time",
    rocks: [],
  },
  {
    title: "Clear the hard parts",
    subtitle: "Rocks stay where the water cannot move them",
    rocks: [
      [7, 5], [7, 6], [7, 7],
      [12, 9], [13, 9], [14, 9],
      [17, 4], [17, 5],
    ],
  },
  {
    title: "Reach the far side",
    subtitle: "Carve around the rocks to fill the Jerry Can",
    rocks: [
      [6, 5], [7, 5], [8, 5], [6, 6], [8, 6], [6, 7], [7, 7], [8, 7],
      [11, 3],
      [15, 10], [16, 10], [17, 10], [16, 9],
    ],
  },
  {
    title: "The zigzag",
    subtitle: "Water only falls — guide it step by step",
    rocks: [
      [4, 4], [5, 4], [6, 4], [7, 4],
      [16, 6], [17, 6], [18, 6], [19, 6],
      [4, 9], [5, 9], [6, 9], [7, 9],
      [14, 12], [15, 12], [16, 12], [17, 12],
      [10, 7], [11, 7], [12, 7], [13, 7],
    ],
  },
  {
    title: "Twin falls",
    subtitle: "Two walls, one narrow way through",
    rocks: [
      // left wall with a gap at row 10
      [9, 2], [9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [9, 9], [9, 11], [9, 12], [9, 13],
      // right wall with a gap at row 5
      [16, 2], [16, 3], [16, 4], [16, 6], [16, 7], [16, 8], [16, 9], [16, 10], [16, 11], [16, 12], [16, 13],
    ],
  },
  {
    title: "The caverns",
    subtitle: "Big hollows of stone to steer around",
    rocks: [
      [5, 4], [6, 4], [7, 4], [5, 5], [7, 5], [5, 6], [6, 6], [7, 6],
      [13, 3], [14, 3], [15, 3], [13, 4], [15, 4], [13, 5], [14, 5], [15, 5],
      [11, 8], [12, 8], [13, 8], [11, 9], [13, 9], [11, 10], [12, 10], [13, 10],
      [3, 11], [4, 11], [19, 8], [20, 8],
    ],
  },
  {
    title: "River split",
    subtitle: "A pillar of rock divides the flow — pick a side",
    rocks: [
      [11, 2], [12, 2], [11, 3], [12, 3], [11, 4], [12, 4], [11, 5], [12, 5],
      [11, 7], [12, 7], [11, 8], [12, 8],
      [4, 10], [5, 10], [6, 10],
      [17, 11], [18, 11],
      [7, 12], [14, 13],
    ],
  },
  {
    title: "The terraces",
    subtitle: "Climb down shelf by shelf",
    rocks: [
      [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4],
      [14, 6], [15, 6], [16, 6], [17, 6], [18, 6], [19, 6], [20, 6],
      [2, 9], [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9],
      [13, 11], [14, 11], [15, 11], [16, 11], [17, 11], [18, 11],
      [11, 4], [11, 5], [10, 9],
    ],
  },
  {
    title: "The narrow way",
    subtitle: "One thin channel threads the needle",
    rocks: [
      [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 8], [7, 9], [7, 10], [7, 11], [7, 12], [7, 13],
      [15, 1], [15, 2], [15, 3], [15, 4], [15, 6], [15, 7], [15, 8], [15, 9], [15, 10], [15, 11], [15, 12], [15, 13],
      [11, 5], [12, 5], [11, 10], [12, 10],
    ],
  },
  {
    title: "The long way down",
    subtitle: "Every shortcut is stone. Earn every drop.",
    rocks: [
      [3, 2], [4, 2], [5, 2], [9, 2], [10, 2], [14, 2], [15, 2], [19, 2], [20, 2],
      [6, 4], [7, 4], [12, 4], [13, 4], [17, 4], [18, 4],
      [2, 6], [3, 6], [8, 6], [9, 6], [15, 6], [21, 6],
      [5, 8], [6, 8], [11, 8], [12, 8], [18, 8], [19, 8],
      [3, 10], [4, 10], [9, 10], [10, 10], [14, 10], [15, 10], [20, 10],
      [6, 12], [7, 12], [16, 12], [17, 12],
      [2, 13], [13, 13],
    ],
  },
];
