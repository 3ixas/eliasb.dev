"use client";

import { useState } from "react";
import { FlowtimeBreakView } from "@/components/site/flowtime-break";
import { focusRange } from "@/content/stretch/flowtime-break";

/** The working Flowtime figure (#464), loaded by its island as the figure nears the viewport: it holds the minutes of focus. */
export default function FlowtimeBreakLive() {
  const [focus, setFocus] = useState<number>(focusRange.start);
  const [moved, setMoved] = useState(false);
  const change = (minutes: number) => {
    setFocus(minutes);
    setMoved(true);
  };
  return <FlowtimeBreakView focus={focus} moved={moved} change={change} />;
}
