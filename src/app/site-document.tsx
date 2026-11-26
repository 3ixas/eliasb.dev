import { SpeedInsights } from "@vercel/speed-insights/next";
import { Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./base.css";
import "./tokens.css";
import "./transitions.css";
import "./zoom.css";
import "./shell.css";
import "./parts.css";

// Both faces are self-hosted, so no request goes to Google when a visitor loads a page.
// Passes and panels (docs/design/DESIGN.md "Type"): Newsreader for headings, figures and prose, with its
// optical-size axis; Instrument Sans for interface text. Both variable in weight and given next/font's fallback
// faces, which it sizes from each font's own metrics so a late font moves nothing.
// tokens.css reads them as --serif and --sans; every route, including the Résumé sheet, uses only these two faces.
// Newsreader is the Google latin file instanced to the weights the site sets (300 to 650) and cut to the characters it
// sets, both axes kept, so headings draw as before from a file 40% smaller (#539; scripts/subset-newsreader.sh).
const newsreader = localFont({
  src: "./fonts/newsreader/newsreader-var-latin.woff2",
  weight: "300 650",
  style: "normal",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  declarations: [{ prop: "font-family", value: "Newsreader" }],
  variable: "--font-newsreader",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  style: "normal",
  variable: "--font-instrument-sans",
});

// Boot script run synchronously in <head> before paint:
// - Sets data-script so header links may wait behind Menu on phones (shell.css); without script they show.
// - Restores remembered theme (elias-theme) and sets data-lights so the theme controller decides when the room changes.
// - Creates <meta name="theme-color"> matching TOOLBAR_COLOUR (components/site/theme.ts; theme.spec.ts keeps them level)
//   imperatively rather than in JSX so React does not recreate a hoisted meta whose content script has changed.
const siteBootScript = `try{const r=document.documentElement;r.dataset.script='';let s=null;try{s=localStorage.getItem('elias-theme');}catch(_){}if(s==='light'||s==='dark')r.dataset.theme=s;else delete r.dataset.theme;const d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;r.dataset.lights=d?'on':'off';const m=document.createElement('meta');m.name='theme-color';m.content=d?'#0d0d0f':'#eeede9';document.head.appendChild(m);}catch(_){}`;

/**
 * The document every page is drawn in: the shared stylesheets, the two faces and the theme boot script. The root layout
 * and the 404 (global-not-found.tsx, which Next.js renders outside the layout) both use it, so they cannot drift.
 */
export function SiteDocument({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${newsreader.variable} ${instrumentSans.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: siteBootScript }} />
      </head>
      <body>
        {children}
        {/* Field Core Web Vitals from real visitors (Vercel Speed Insights, free tier). No cookies; loads from /_vercel/, after the page. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
