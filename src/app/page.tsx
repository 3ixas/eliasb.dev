import { siteDescription } from "@/content/site";
import type { Metadata } from "next";
import { Homepage } from "@/components/site/homepage";

export const metadata: Metadata = {
  title: "Elias Bennett | Software engineer and product builder",
  description: siteDescription,
};

export default function Home() {
  return <Homepage />;
}
