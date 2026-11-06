import { JetBrains_Mono } from "next/font/google";

// The Résumé sheet keeps JetBrains Mono, which matches its PDF. Loaded here so no other page downloads it.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export default function ResumeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className={jetbrainsMono.variable}>{children}</div>;
}
