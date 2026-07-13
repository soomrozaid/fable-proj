"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { QRPreview } from "@/components/qr/QRPreview";
import { envClient } from "@/config/env.client";

const StoneScene = dynamic(() => import("./StoneScene"), {
  ssr: false,
  loading: () => <HeroFallback />,
});

const DESTINATIONS = [
  { label: "→ your spring menu", tone: "text-verdigris-deep" },
  { label: "→ tonight's event page", tone: "text-copper" },
  { label: "→ the updated price list", tone: "text-verdigris-deep" },
  { label: "→ wherever you need next", tone: "text-ink-soft" },
];

function HeroFallback() {
  return (
    <div className="mx-auto w-full max-w-70">
      <QRPreview
        data={envClient.APP_URL}
        options={{ fg: "#26221d", bg: "#ece5d3", shape: "square" }}
      />
    </div>
  );
}

let webglSupport: boolean | null = null;
function detectWebGL(): boolean {
  if (webglSupport === null) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = Boolean(
        canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
      );
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}
const noopSubscribe = () => () => {};

/** null on the server (renders the fallback), then the real capability. */
function useWebGLOk(): boolean | null {
  return useSyncExternalStore(noopSubscribe, detectWebGL, () => null);
}

const REDUCED_MQ = "(prefers-reduced-motion: reduce)";
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_MQ);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MQ).matches,
    () => false,
  );
}

export function HeroVisual() {
  const webgl = useWebGLOk();
  const reducedMotion = usePrefersReducedMotion();
  const [destIndex, setDestIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => {
      setDestIndex((i) => (i + 1) % DESTINATIONS.length);
    }, 2600);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const dest = DESTINATIONS[destIndex] ?? DESTINATIONS[0]!;

  return (
    <div className="relative">
      <div className="aspect-square w-full" data-testid="hero-visual">
        {webgl === false ? (
          <HeroFallback />
        ) : (
          <StoneScene url={envClient.APP_URL} animate={!reducedMotion} />
        )}
      </div>
      <div className="mt-2 flex justify-center">
        <p
          className="rounded-full border border-line bg-paper/95 px-4 py-1.5 font-mono text-sm shadow-sm"
          aria-live="off"
        >
          <span className="text-ink-faint">same code </span>
          <span className={dest.tone}>{dest.label}</span>
        </p>
      </div>
      <p className="mt-4 text-center text-xs text-ink-faint">
        This is a real Scanstone code — point your camera at it.
      </p>
    </div>
  );
}
