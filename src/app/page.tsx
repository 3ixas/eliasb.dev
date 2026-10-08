import type { Metadata } from "next";
import { Homepage } from "@/components/site/homepage";
import { siteCopy } from "@/content/stretch/site-copy";

export const metadata: Metadata = {
  title: { absolute: siteCopy.titleHome },
  description: siteCopy.description,
};

export default function Home() {
  return <Homepage />;
}

/** The Off the clock signals (book, film, history) refresh through this cached page every 15 minutes, the shortest of their own caches (Letterboxd). */
export const revalidate = 900;
