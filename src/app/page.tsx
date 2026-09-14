import type { Metadata } from "next";
import { ConceptPrototype } from "@/components/concept-prototype";

export const metadata: Metadata = {
  title: "Elias B. — Thoughtful software for complex problems",
  description:
    "Elias B. is a software engineer working across product, interface, and systems.",
};

export default function Home() {
  return <ConceptPrototype direction="cabinet-of-curiosities" reviewMode={false} />;
}
