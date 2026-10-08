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
