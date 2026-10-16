import type { Metadata } from "next";
import { Homepage } from "@/components/site/homepage";
import { HOW_VARIANTS } from "@/components/site/how-i-work.prototype";
import { siteCopy } from "@/content/stretch/site-copy";

export const metadata: Metadata = {
  title: { absolute: siteCopy.titleHome },
  description: siteCopy.description,
};

/** PROTOTYPE (#195): ?variant= picks a How I work variant; outside production only. */
export default async function Home({ searchParams }: { searchParams: Promise<{ variant?: string }> }) {
  if (process.env.NODE_ENV === "production") return <Homepage />;
  const { variant } = await searchParams;
  const howVariant = HOW_VARIANTS.find((key) => key === variant?.toUpperCase()) ?? null;
  return <Homepage howVariant={howVariant} />;
}

/** The Off the clock signals (book, film, history) refresh through this cached page every 15 minutes, the shortest of their own caches (Letterboxd). */
export const revalidate = 900;
