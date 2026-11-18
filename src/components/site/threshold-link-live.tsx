"use client";

import { useState } from "react";
import { ThresholdLinkView, type LinkPart } from "@/components/site/threshold-link";
import { firstDistrict, thresholdStart, type ThresholdChoice } from "@/content/stretch/threshold-link";

/**
 * The working Threshold link (#462), loaded by its island as the figure nears the viewport. A choice rewrites the link
 * at once; a new city starts on its first district, Threshold's own default, so both of those parts change.
 */
export default function ThresholdLinkLive() {
  const [{ choice, changed }, setState] = useState<{ choice: ThresholdChoice; changed: readonly LinkPart[] }>({ choice: thresholdStart, changed: [] });

  const choose = (part: LinkPart, value: string) =>
    setState(({ choice: last }) => {
      if (part === "city") {
        const city = value as ThresholdChoice["city"];
        return { choice: { ...last, city, district: firstDistrict(city) }, changed: ["city", "district"] };
      }
      return { choice: { ...last, [part]: value }, changed: [part] };
    });

  return <ThresholdLinkView choice={choice} changed={changed} choose={choose} />;
}
