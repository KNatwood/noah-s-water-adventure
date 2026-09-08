import { createFileRoute, Link } from "@tanstack/react-router";
import { QUOTES } from "@/lib/quotes";
import cwLogo from "@/assets/cw-logo-allwhite.png.asset.json";
import jerryCanYellow from "@/assets/jerry-can-yellow.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Water Quest — dig the path, fill the can" },
      {
        name: "description",
        content:
          "Water Quest is a little digging game inspired by charity: water. Open the earth, guide clean water to the jerry can, and help change everything.",
      },
      { property: "og:title", content: "Water Quest — dig the path, fill the can" },
      {
        property: "og:description",
        content:
          "A little game about a big thing: clean water. Dig a channel, fill the jerry can, and support charity: water.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StartPage,
});

function StartPage() {
  const quote = QUOTES[0];

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <img
          src={cwLogo.url}
          alt="charity: water"
          className="h-5 w-auto"
        />
        <a
          href="https://www.charitywater.org/donate"
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-brand px-5 py-2 text-sm font-extrabold text-brand-foreground transition-transform hover:scale-105"
        >
          Donate
        </a>
      </header>

      {/* Hero */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 px-6 py-10 text-center">
        <div className="flex flex-col items-center gap-6">
          <img
            src={jerryCanYellow.url}
            alt="The yellow charity: water jerry can"
            className="h-44 w-auto drop-shadow-[0_18px_40px_oklch(0.852_0.169_91.5/0.35)] md:h-56"
          />
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-brand">
            A little game about a big thing
          </p>
          <h1 className="font-display text-6xl font-black leading-none text-card md:text-8xl">
            Water
            <br />
            Quest
          </h1>
          <p className="max-w-md text-lg font-medium text-card/70">
            Dig the earth open, one touch at a time, and guide clean water all
            the way to the yellow jerry can.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/play"
            className="rounded-full bg-brand px-10 py-4 font-display text-xl font-black text-brand-foreground transition-transform hover:scale-105"
          >
            Start playing
          </Link>
          <a
            href="https://www.charitywater.org/donate"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border-2 border-card/30 px-10 py-4 font-display text-xl font-black text-card transition-colors hover:border-card hover:bg-card/10"
          >
            Donate to charity: water
          </a>
        </div>

        {/* Quote */}
        <figure className="mt-6 max-w-lg">
          <blockquote className="text-2xl font-bold text-card">
            “{quote.text}”
          </blockquote>
          <figcaption className="mt-2 text-sm font-semibold uppercase tracking-widest text-brand">
            — {quote.attribution}
          </figcaption>
        </figure>
      </main>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-5xl px-6 py-6 text-center">
        <p className="text-xs text-card/50">
          An unofficial fan-made game inspired by{" "}
          <a
            href="https://www.charitywater.org"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-card/80 underline-offset-4 hover:underline"
          >
            charity: water
          </a>
          . 1 in 10 people worldwide live without access to clean water — every
          gift helps change that.
        </p>
      </footer>
    </div>
  );
}
