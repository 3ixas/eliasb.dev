"use client";

import { useEffect, useRef, useState } from "react";
import { ArgusProvenanceView } from "@/components/site/argus-provenance";
import { argusPositions, argusProvenanceCopy as copy, formatUsd, priceSteps, unrealisedUsd, type ArgusPosition } from "@/content/stretch/argus-provenance";

type Held = Omit<ArgusPosition, "age"> & { at: number };

/**
 * The working Argus figure (#463), loaded by its island as the figure nears the viewport. Each price keeps the moment
 * it arrived; an age is now minus that moment. The clock ticks once a second only while a number is open and the
 * figure is on screen, so an age shown is current and nothing runs unseen. New event brings the next price for the
 * oldest position, opens it so its new source shows, and says so politely.
 */
export default function ArgusProvenanceLive() {
  const box = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState<Held[]>(() => {
    const start = Date.now();
    return argusPositions.map(({ age, ...position }) => ({ ...position, at: start - age * 1000 }));
  });
  const [now, setNow] = useState(() => Date.now());
  const [open, setOpen] = useState<readonly string[]>([]);
  const [changed, setChanged] = useState<string>();
  const [announcement, setAnnouncement] = useState("");
  const [seen, setSeen] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const watcher = new IntersectionObserver(([entry]) => setSeen(entry.isIntersecting));
    watcher.observe(element);
    return () => watcher.disconnect();
  }, []);

  const ticking = seen && open.length > 0;
  useEffect(() => {
    if (!ticking) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [ticking]);

  const toggle = (symbol: string) => {
    setNow(Date.now());
    setOpen((was) => (was.includes(symbol) ? was.filter((entry) => entry !== symbol) : [...was, symbol]));
  };

  const newEvent = () => {
    const at = Date.now();
    const oldest = held.reduce((a, b) => (b.at < a.at ? b : a));
    const next = { ...oldest, price: Math.round(oldest.price * (1 + priceSteps[step % priceSteps.length]) * 100) / 100, at };
    setHeld(held.map((position) => (position.symbol === oldest.symbol ? next : position)));
    setStep(step + 1);
    setNow(at);
    setChanged(oldest.symbol);
    setOpen((was) => (was.includes(oldest.symbol) ? was : [...was, oldest.symbol]));
    setAnnouncement(copy.announce(oldest.symbol, formatUsd(unrealisedUsd(next))));
  };

  const positions = held.map(({ at, ...position }) => ({ ...position, age: Math.max(0, (now - at) / 1000) }));
  return (
    <div ref={box}>
      <ArgusProvenanceView positions={positions} open={open} changed={changed} announcement={announcement} toggle={toggle} newEvent={newEvent} />
    </div>
  );
}
