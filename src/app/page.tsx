import type { Metadata } from "next";
import { Homepage } from "@/components/site/homepage";

export const metadata: Metadata = {
  title: "Elias B. — Software that makes complex things easier to understand",
  description: "Projects, experiments, and a few things I enjoy outside work.",
};

export default function Home() {
  return <Homepage />;
}
