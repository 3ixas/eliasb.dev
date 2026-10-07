import { homeTitle, siteDescription } from "@/content/site";
import type { Metadata } from "next";
import { Homepage } from "@/components/site/homepage";

export const metadata: Metadata = {
  title: homeTitle,
  description: siteDescription,
};

export default function Home() {
  return <Homepage />;
}
