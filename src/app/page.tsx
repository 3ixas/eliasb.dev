import type { Metadata } from "next";
import { Homepage } from "@/components/site/homepage";

export const metadata: Metadata = {
  title: "Elias B. — Software that untangles complex systems",
  description: "I’m Elias, a software engineer in London. Here’s what I build and what I get up to outside work.",
};

export default function Home() {
  return <Homepage />;
}
