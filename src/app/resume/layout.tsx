import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

// The Résumé sheet keeps the faces its PDF was drawn in: Bricolage Grotesque for its text and JetBrains Mono for its
// metadata. Loaded here so no other page downloads them. Bricolage's fallback faces are in stretch-resume.css.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-bricolage",
  adjustFontFallback: false,
  fallback: ["Bricolage Fallback", "system-ui", "sans-serif"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export default function ResumeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={`${bricolage.variable} ${jetbrainsMono.variable}`}>{children}</div>;
}
