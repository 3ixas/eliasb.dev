import type { ReactNode } from "react";
import "@/app/pass.css";

/** Loads pass.css for the dev share-pass capture fixture without altering the fingerprinted page.tsx. */
export default function SharePassesLayout({ children }: { children: ReactNode }) {
  return children;
}
