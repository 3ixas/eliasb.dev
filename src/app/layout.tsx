import type { Metadata } from "next";
import "./globals.css";

const isIndexable = process.env.SITE_INDEXABLE === "true";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.eliasb.dev"),
  title: {
    default: "Elias Bennett — Software engineer and product builder",
    template: "%s · Elias B.",
  },
  description:
    "I’m Elias, a software engineer in London. I help shape product ideas, build across the stack with others, and stay involved through launch and the changes that follow.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Elias B.",
    url: "/",
    title: "Elias Bennett — Software engineer and product builder",
    description:
      "I help shape product ideas, build across the stack with others, and stay involved through launch and the changes that follow.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elias Bennett — Software engineer and product builder",
    description:
      "I help shape product ideas, build across the stack with others, and stay involved through launch and the changes that follow.",
    images: ["/opengraph-image"],
  },
  robots: { index: isIndexable, follow: isIndexable },
};

const siteBootScript = `
  try {
    const saved = localStorage.getItem('elias-theme');
    if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
    else delete document.documentElement.dataset.theme;
  } catch (_) {}
  try {
    (() => {
      const root = document.documentElement;
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (location.pathname !== '/' || (location.hash && location.hash !== '#top') || motion.matches) return;
      root.dataset.homeOpening = 'running';
      let fallbackTimer;
      const cleanup = () => {
        window.clearTimeout(fallbackTimer);
        motion.removeEventListener('change', onMotionChange);
        window.removeEventListener('home-opening-completed', cleanup);
      };
      const finish = () => {
        if (!root.hasAttribute('data-home-opening')) return;
        root.removeAttribute('data-home-opening');
        cleanup();
        window.dispatchEvent(new Event('home-opening-finish'));
      };
      const onMotionChange = (event) => {
        if (event.matches) finish();
      };
      motion.addEventListener('change', onMotionChange);
      window.addEventListener('home-opening-completed', cleanup);
      fallbackTimer = window.setTimeout(finish, 7000);
    })();
  } catch (_) {}
  try {
    (() => {
      const root = document.documentElement;
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (typeof IntersectionObserver === 'undefined') return;

      let observer;
      let mutationObserver;
      let started = false;
      const selector = '[data-motion-reveal]';

      document.addEventListener('focusin', (event) => {
        let target = event.target;
        while (target instanceof Element) {
          if (target.matches(selector)) {
            observer?.unobserve(target);
            target.dataset.motionEntered = 'complete';
          }
          target = target.parentElement;
        }
      });

      const observeTarget = (target) => {
        if (
          target instanceof HTMLElement &&
          target.matches(selector) &&
          !target.dataset.motionEntered
        ) {
          observer?.observe(target);
        }
      };

      const startObserving = () => {
        if (started || motion.matches || !root.hasAttribute('data-motion-reveals')) return;
        if (root.hasAttribute('data-home-opening') && root.dataset.homeOpening !== 'complete') return;
        if (!document.body) {
          window.addEventListener('DOMContentLoaded', startObserving, { once: true });
          return;
        }

        try {
          observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              const target = entry.target;
              observer.unobserve(target);
              target.dataset.motionEntered = 'true';
              const markComplete = () => {
                if (target.dataset.motionEntered === 'true') target.dataset.motionEntered = 'complete';
              };
              const onAnimationEnd = (event) => {
                if (event.target !== target || event.animationName !== 'site-object-enter') return;
                target.removeEventListener('animationend', onAnimationEnd);
                markComplete();
              };
              target.addEventListener('animationend', onAnimationEnd);
              window.setTimeout(() => {
                target.removeEventListener('animationend', onAnimationEnd);
                markComplete();
              }, 1000);
            }
          }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
          root.dataset.motionReveals = 'active';
          started = true;
          document.querySelectorAll(selector).forEach(observeTarget);
          mutationObserver = new MutationObserver((records) => {
            for (const record of records) {
              for (const node of record.addedNodes) {
                if (!(node instanceof HTMLElement)) continue;
                observeTarget(node);
                node.querySelectorAll(selector).forEach(observeTarget);
              }
            }
          });
          mutationObserver.observe(document.body, { childList: true, subtree: true });
        } catch (_) {
          observer?.disconnect();
          mutationObserver?.disconnect();
          started = false;
          root.removeAttribute('data-motion-reveals');
        }
      };

      window.addEventListener('home-opening-completed', startObserving);
      window.addEventListener('home-opening-finish', startObserving);

      const syncMotionPreference = (event) => {
        if (event.matches) {
          observer?.disconnect();
          mutationObserver?.disconnect();
          started = false;
          document.querySelectorAll('[data-motion-entered="true"]').forEach((target) => {
            target.dataset.motionEntered = 'complete';
          });
          root.removeAttribute('data-motion-reveals');
          return;
        }
        root.dataset.motionReveals = 'pending';
        startObserving();
      };
      motion.addEventListener('change', syncMotionPreference);

      if (motion.matches) return;
      root.dataset.motionReveals = 'pending';
      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', startObserving, { once: true });
      } else {
        startObserving();
      }
    })();
  } catch (_) {
    document.documentElement.removeAttribute('data-motion-reveals');
  }
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: siteBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
