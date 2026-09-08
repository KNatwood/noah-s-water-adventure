export interface Quote {
  text: string;
  attribution: string;
}

export const QUOTES: Quote[] = [
  { text: "Water changes everything.", attribution: "charity: water" },
  {
    text: "Thousands have lived without love, not one without water.",
    attribution: "W. H. Auden",
  },
  {
    text: "Water is life's matter and matrix, mother and medium.",
    attribution: "Albert Szent-Györgyi",
  },
  {
    text: "1 in 10 people worldwide live without access to clean water.",
    attribution: "charity: water",
  },
  { text: "Every drop counts. Every dig matters.", attribution: "Water Quest" },
  {
    text: "When the water flows, hope follows.",
    attribution: "Water Quest",
  },
  {
    text: "Access to clean water means education, income and health — especially for women and kids.",
    attribution: "charity: water",
  },
];

export function quoteForLevel(levelIndex: number): Quote {
  return QUOTES[levelIndex % QUOTES.length]!;
}
