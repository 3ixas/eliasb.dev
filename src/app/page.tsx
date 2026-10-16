import type { Metadata } from "next";
import { Homepage } from "@/components/site/homepage";
import { ENDING_VARIANTS } from "@/components/site/page-ending.prototype";
import { siteCopy } from "@/content/stretch/site-copy";

export const metadata: Metadata = {
  title: { absolute: siteCopy.titleHome },
  description: siteCopy.description,
};

/** PROTOTYPE (#200): ?variant= picks an ending; outside production only. */
export default async function Home({ searchParams }: { searchParams: Promise<{ variant?: string }> }) {
  if (process.env.NODE_ENV === "production") return <Homepage />;
  const { variant } = await searchParams;
  const endingVariant = ENDING_VARIANTS.find((key) => key === variant?.toUpperCase()) ?? null;
  return <Homepage endingVariant={endingVariant} />;
}

/** The Off the clock signals (book, film, history) refresh through this cached page every 15 minutes, the shortest of their own caches (Letterboxd). */
export const revalidate = 900;
