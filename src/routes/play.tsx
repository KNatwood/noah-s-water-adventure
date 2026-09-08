import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { WaterGame } from "@/components/WaterGame";
import { LEVELS } from "@/lib/levels";
import cwLogoVertical from "@/assets/cw-logo-vertical-black.png.asset.json";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play Water Quest — guide water to the jerry can" },
      {
        name: "description",
        content:
          "Dig channels through the soil and guide clean water to the jerry can across ten rocky levels, inspired by charity: water.",
      },
      { property: "og:title", content: "Play Water Quest" },
      {
        property: "og:description",
        content:
          "Dig channels through the soil and guide clean water to the jerry can across ten rocky levels.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const [levelIndex, setLevelIndex] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={cwLogoVertical.url} alt="charity: water" className="h-8 w-auto" />
          <span className="font-display text-lg font-black text-foreground">
            Water Quest
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-bold uppercase tracking-widest text-muted-foreground sm:block">
            {LEVELS.length} levels
          </span>
          <a
            href="https://www.charitywater.org/donate"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-brand px-4 py-1.5 text-sm font-extrabold text-brand-foreground transition-transform hover:scale-105"
          >
            Donate
          </a>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl justify-center px-4 pb-16 pt-2">
        <WaterGame levelIndex={levelIndex} onSelectLevel={setLevelIndex} />
      </main>
    </div>
  );
}
