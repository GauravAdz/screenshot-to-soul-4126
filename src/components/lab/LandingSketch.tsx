/**
 * Hand-drawn landing illustration: a report card, a range bar, a hand-drawn
 * arrow and a plain-words note. Pure SVG so it stays crisp, inherits the
 * theme colors and never loads an extra asset.
 */
export function LandingSketch({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 300"
      role="img"
      aria-label="A sketch of a lab report card with a range bar pointing to a short note that reads in range."
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* tape holding the card to the page */}
      <path d="M26 22 L92 12 L98 36 L32 46 Z" fill="var(--accent)" opacity="0.75" />

      {/* report card */}
      <path
        d="M40 44 C40 34 46 30 58 29 L262 22 C275 21 281 27 280 38 L286 246 C287 258 280 263 269 262 L52 268 C40 269 34 262 35 251 Z"
        fill="var(--card)"
        stroke="color-mix(in oklab, var(--foreground) 40%, transparent)"
        strokeWidth="2"
        className="sketch-draw"
      />

      {/* title + subtitle scribbles */}
      <path d="M62 66 C96 60 132 70 176 63" stroke="color-mix(in oklab, var(--foreground) 28%, transparent)" strokeWidth="5" />
      <path d="M62 84 C86 80 106 87 128 82" stroke="color-mix(in oklab, var(--foreground) 15%, transparent)" strokeWidth="4" />

      {/* result rows: label scribble, value scribble, status dot */}
      <path d="M62 126 C88 121 116 129 148 124" stroke="color-mix(in oklab, var(--foreground) 20%, transparent)" strokeWidth="4" />
      <path d="M196 126 C206 121 218 129 232 124" stroke="color-mix(in oklab, var(--foreground) 50%, transparent)" strokeWidth="5" />
      <circle cx="254" cy="124" r="6" fill="var(--status-in)" />

      <path d="M62 166 C88 161 116 169 148 164" stroke="color-mix(in oklab, var(--foreground) 20%, transparent)" strokeWidth="4" />
      <path d="M196 166 C206 161 218 169 232 164" stroke="color-mix(in oklab, var(--foreground) 50%, transparent)" strokeWidth="5" />
      <circle cx="254" cy="164" r="6" fill="var(--status-high)" />

      <path d="M62 206 C88 201 116 209 148 204" stroke="color-mix(in oklab, var(--foreground) 20%, transparent)" strokeWidth="4" />
      <path d="M196 206 C206 201 218 209 232 204" stroke="color-mix(in oklab, var(--foreground) 50%, transparent)" strokeWidth="5" />
      <circle cx="254" cy="204" r="6" fill="var(--status-low)" />

      {/* the lab's own range, with a marker on it */}
      <path d="M62 232 C120 227 200 236 258 230" stroke="color-mix(in oklab, var(--foreground) 25%, transparent)" strokeWidth="3" />
      <path d="M62 226 L62 238" stroke="color-mix(in oklab, var(--foreground) 25%, transparent)" strokeWidth="3" />
      <path d="M258 224 L258 236" stroke="color-mix(in oklab, var(--foreground) 25%, transparent)" strokeWidth="3" />
      <circle cx="150" cy="230" r="8" fill="var(--card)" stroke="var(--primary)" strokeWidth="2.5" />

      {/* hand-drawn arrow to the note */}
      <path d="M296 150 C322 130 332 172 356 148" stroke="color-mix(in oklab, var(--foreground) 45%, transparent)" strokeWidth="2.5" />
      <path d="M348 140 L358 148 L346 157" stroke="color-mix(in oklab, var(--foreground) 45%, transparent)" strokeWidth="2.5" />

      {/* plain-words note */}
      <path
        d="M400 96 C400 88 406 84 416 83 L502 80 C513 79 518 86 517 96 L519 158 C520 169 513 174 503 173 L418 177 C407 178 401 172 401 162 Z"
        fill="var(--card)"
        stroke="color-mix(in oklab, var(--foreground) 40%, transparent)"
        strokeWidth="2"
        className="sketch-draw"
      />
      <path d="M401 132 L374 146 L403 156" fill="var(--card)" stroke="color-mix(in oklab, var(--foreground) 40%, transparent)" strokeWidth="2" />
      <path d="M424 118 L436 132 L464 100" stroke="var(--status-in)" strokeWidth="5" />
      <text x="424" y="162" fontSize="17" fontWeight="600" fill="var(--foreground)" fontFamily="inherit">
        In range
      </text>

      {/* little pencil sparkle */}
      <path d="M534 196 L534 212 M526 204 L542 204" stroke="color-mix(in oklab, var(--foreground) 25%, transparent)" strokeWidth="2.5" />
      <path d="M20 214 C26 206 30 220 36 212" stroke="color-mix(in oklab, var(--foreground) 18%, transparent)" strokeWidth="2.5" />
    </svg>
  );
}
