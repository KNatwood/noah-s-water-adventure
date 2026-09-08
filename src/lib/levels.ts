export interface Level {
  title: string;
  subtitle: string;
  /** [col, row] rock positions. col 0-23, row 0-15 */
  rocks: [number, number][];
}

export const COLS = 24;
export const ROWS = 16;

/** Cells that can never be dug: the jerry can zone and the bedrock floor.
 *  This is the finish-line fix — water can no longer be drained past the
 *  goal by digging through it, and it can never fall out the bottom. */
export function solidCells(): Set<number> {
  const s = new Set<number>();
  // bedrock floor across the whole bottom row
  for (let c = 0; c < COLS; c++) s.add(15 * COLS + c);
  // solid block around the jerry can body (cols 10-13, rows 13-14)
  for (let r = 13; r <= 14; r++)
    for (let c = 10; c <= 13; c++) s.add(r * COLS + c);
  return s;
}

/** Mouth cells just above the can — water touching these fills the can. */
export const MOUTH_CELLS: number[] = [12 * COLS + 11, 12 * COLS + 12];

/** Where water enters the grid. */
export const SOURCE_CELLS: number[] = [11, 12]; // row 0, cols 11-12

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
      [4, 3], [5, 3], [6, 3], [7, 3],
      [16, 5], [17, 5], [18, 5], [19, 5],
      [4, 8], [5, 8], [6, 8], [7, 8],
      [16, 11], [17, 11], [18, 11], [19, 11],
      [10, 6], [11, 6], [12, 6], [13, 6],
    ],
  },
  {
    title: "Twin falls",
    subtitle: "Two walls, one narrow way through",
    rocks: [
      // left wall with a gap at row 9
      [9, 2], [9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [9, 10], [9, 11], [9, 12],
      // right wall with a gap at row 4
      [15, 2], [15, 3], [15, 5], [15, 6], [15, 7], [15, 8], [15, 9], [15, 10], [15, 11], [15, 12],
    ],
  },
  {
    title: "The caverns",
    subtitle: "Big hollows of stone to steer around",
    rocks: [
      [5, 4], [6, 4], [7, 4], [5, 5], [7, 5], [5, 6], [6, 6], [7, 6],
      [16, 3], [17, 3], [18, 3], [16, 4], [18, 4], [16, 5], [17, 5], [18, 5],
      [11, 8], [12, 8], [13, 8], [11, 9], [13, 9], [11, 10], [12, 10], [13, 10],
      [3, 11], [4, 11], [20, 8], [21, 8],
    ],
  },
  {
    title: "River split",
    subtitle: "A pillar of rock divides the flow — pick a side",
    rocks: [
      [11, 3], [12, 3], [11, 4], [12, 4], [11, 5], [12, 5], [11, 6], [12, 6],
      [11, 7], [12, 7], [11, 8], [12, 8],
      [4, 10], [5, 10], [6, 10],
      [17, 10], [18, 10], [19, 10],
      [7, 12], [16, 12],
    ],
  },
  {
    title: "The terraces",
    subtitle: "Climb down shelf by shelf",
    rocks: [
      [2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [8, 4],
      [15, 6], [16, 6], [17, 6], [18, 6], [19, 6], [20, 6], [21, 6],
      [2, 9], [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9],
      [15, 11], [16, 11], [17, 11], [18, 11], [19, 11], [20, 11], [21, 11],
      [11, 4], [12, 4], [11, 9], [12, 9],
    ],
  },
  {
    title: "The narrow way",
    subtitle: "One thin channel threads the needle",
    rocks: [
      // two long walls leaving single-cell channels
      [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 8], [7, 9], [7, 10], [7, 11], [7, 12], [7, 13],
      [16, 1], [16, 2], [16, 3], [16, 4], [16, 6], [16, 7], [16, 8], [16, 9], [16, 10], [16, 11], [16, 12], [16, 13],
      [11, 5], [12, 5], [11, 10], [12, 10],
    ],
  },
  {
    title: "The long way down",
    subtitle: "Every shortcut is stone. Earn every drop.",
    rocks: [
      [3, 2], [4, 2], [5, 2], [9, 2], [10, 2], [14, 2], [15, 2], [19, 2], [20, 2],
      [6, 4], [7, 4], [12, 4], [13, 4], [17, 4], [18, 4],
      [2, 6], [3, 6], [8, 6], [9, 6], [15, 6], [16, 6], [21, 6],
      [5, 8], [6, 8], [11, 8], [12, 8], [18, 8], [19, 8],
      [3, 10], [4, 10], [9, 10], [10, 10], [14, 10], [15, 10], [20, 10],
      [6, 12], [7, 12], [16, 12], [17, 12], [21, 12],
      [2, 13], [21, 13],
    ],
  },
];
