import type { ReactNode } from "react";

export function InViewMotion({ children }: { children: ReactNode }) {
  return <div className="signal-motion" data-motion-reveal>{children}</div>;
}
