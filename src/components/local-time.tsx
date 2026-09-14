"use client";

import { useEffect, useState } from "react";

function londonTime() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function LocalTime() {
  const [time, setTime] = useState(londonTime);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(londonTime()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return <time suppressHydrationWarning>{time} London</time>;
}
