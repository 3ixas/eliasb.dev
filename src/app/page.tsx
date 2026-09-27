import type { Metadata } from "next";
import { Homepage } from "@/components/site/homepage";

export const metadata: Metadata = {
  title: "Elias Bennett — Software engineer and product builder",
  description: "I’m Elias, a software engineer in London. I help shape product ideas, build across the stack with others, and stay involved through launch and the changes that follow.",
};

export default function Home() {
  return <Homepage />;
}
