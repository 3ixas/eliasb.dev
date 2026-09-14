import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConceptPrototype } from "@/components/concept-prototype";
import { conceptDirections, isConceptDirection } from "@/lib/concepts";

export function generateStaticParams() {
  return Object.keys(conceptDirections).map((direction) => ({ direction }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ direction: string }>;
}): Promise<Metadata> {
  const { direction } = await params;
  if (!isConceptDirection(direction)) return {};
  return { title: conceptDirections[direction].name };
}

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ direction: string }>;
}) {
  const { direction } = await params;
  if (!isConceptDirection(direction)) notFound();
  return <ConceptPrototype direction={direction} />;
}
