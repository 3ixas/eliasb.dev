"use client";

import { useSyncExternalStore } from "react";
import { CalendarTile } from "@/components/quiet/calendar-tile";

const noSubscription = () => () => {};
const dayOfMonth = () => String(new Date().getDate());
/** A page built once cannot know the visitor's day: the tile is blank until the browser reads it. */
const unknownOnServer = () => "";

/** A calendar tile showing the visitor's own day of the month, with the cobalt band that marks today. */
export function TodayTile() {
  const number = useSyncExternalStore(noSubscription, dayOfMonth, unknownOnServer);
  return <CalendarTile number={number} today />;
}
