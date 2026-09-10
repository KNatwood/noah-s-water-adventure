# Water Quest rebuild

- [x] Extract game mechanics + levels from published Replit bundle
- [x] User pasted original source: kept original mechanics (source col 2 row 1, goal col 21 row 13, front-based falling water, opening pockets, R to restart)
- [x] Download charity: water brand assets from Drive; uploaded to CDN
- [x] Brand design tokens in styles.css (CW yellow, water blue, dirt/rock/bedrock, Nunito)
- [x] Start page (/): CW branding, jerry can hero, quote, Start + Donate buttons
- [x] Game page (/play): rebuilt digging + falling water, fill meter, win overlay with rotating quotes
- [x] Finish-line fix: jerry can stands on non-diggable bedrock; water touching the can mouth fills it — digging under/past it no longer loses the win
- [x] 10 levels (original 3 + 7 new) with level select
- [x] Jerry can graphic now the official yellow PNG from Drive
- [x] Head metadata + jerry can favicon
- [x] Verified in browser: dug a channel on level 1, water reached the can, win overlay appeared

Open: donate link currently points to https://www.charitywater.org/donate — confirm with user.
- [x] Score system (time-based, per-level best, running total), level timer, and Web Audio sound effects (digging, trickling, filling drips, win chime) with a sound on/off toggle
