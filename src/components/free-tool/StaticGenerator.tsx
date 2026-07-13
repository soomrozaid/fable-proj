"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { QRPreview } from "@/components/qr/QRPreview";
import { DesignControls } from "@/components/qr/DesignControls";
import { downloadPng, downloadSvg } from "@/components/qr/download";
import { wifiPayload, vcardPayload } from "@/lib/qr/payloads";
import { isScannableCombo } from "@/lib/qr/contrast";
import { Button, Input, Label, Card } from "@/components/ui";
import type { QRDesign } from "@/lib/validate";

export type GeneratorMode = "url" | "text" | "wifi" | "vcard";

const MODES: Array<{ id: GeneratorMode; label: string }> = [
  { id: "url", label: "Link" },
  { id: "text", label: "Text" },
  { id: "wifi", label: "WiFi" },
  { id: "vcard", label: "Contact" },
];

const MAX_LEN = 1600;

export function StaticGenerator({
  initialMode = "url",
}: {
  initialMode?: GeneratorMode;
}) {
  const [mode, setMode] = useState<GeneratorMode>(initialMode);
  const [design, setDesign] = useState<QRDesign>({
    fg: "#1c1917",
    bg: "#ffffff",
    shape: "square",
  });

  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [wifi, setWifi] = useState({
    ssid: "",
    password: "",
    security: "WPA" as const,
  });
  const [vcard, setVcard] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    phone: "",
    email: "",
    website: "",
  });
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const payload = useMemo(() => {
    try {
      switch (mode) {
        case "url": {
          const v = url.trim();
          if (!v) return "";
          return /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`;
        }
        case "text":
          return text.trim();
        case "wifi":
          return wifi.ssid ? wifiPayload(wifi) : "";
        case "vcard":
          return vcard.firstName || vcard.lastName ? vcardPayload(vcard) : "";
      }
    } catch {
      return "";
    }
  }, [mode, url, text, wifi, vcard]);

  const tooLong = payload.length > MAX_LEN;
  const scannable = isScannableCombo(design.fg, design.bg);
  const ready = payload.length > 0 && !tooLong && scannable;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div
          role="tablist"
          aria-label="QR content type"
          className="flex flex-wrap gap-2"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-md border px-4 py-2 text-sm font-medium ${
                mode === m.id
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink-soft hover:border-ink-faint"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === "url" ? (
          <div>
            <Label htmlFor="gen-url">Destination link</Label>
            <Input
              id="gen-url"
              type="url"
              inputMode="url"
              placeholder="https://example.com/menu"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
            />
          </div>
        ) : null}

        {mode === "text" ? (
          <div>
            <Label htmlFor="gen-text">Text</Label>
            <textarea
              id="gen-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              maxLength={MAX_LEN}
              placeholder="Any text — a message, a serial number, a note"
              className="w-full rounded-md border border-line bg-white/70 px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-verdigris"
            />
          </div>
        ) : null}

        {mode === "wifi" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="wifi-ssid">Network name (SSID)</Label>
              <Input
                id="wifi-ssid"
                value={wifi.ssid}
                onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                placeholder="CafeGuest"
              />
            </div>
            <div>
              <Label htmlFor="wifi-pass">Password</Label>
              <Input
                id="wifi-pass"
                value={wifi.password}
                onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                placeholder="Leave empty for open networks"
              />
            </div>
            <p className="text-xs text-ink-faint sm:col-span-2">
              Guests point their camera and join — no typing. The password is
              embedded in the code itself and never sent to us.
            </p>
          </div>
        ) : null}

        {mode === "vcard" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="vc-first">First name</Label>
              <Input
                id="vc-first"
                value={vcard.firstName}
                onChange={(e) =>
                  setVcard({ ...vcard, firstName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="vc-last">Last name</Label>
              <Input
                id="vc-last"
                value={vcard.lastName}
                onChange={(e) =>
                  setVcard({ ...vcard, lastName: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="vc-org">Company</Label>
              <Input
                id="vc-org"
                value={vcard.organization}
                onChange={(e) =>
                  setVcard({ ...vcard, organization: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="vc-phone">Phone</Label>
              <Input
                id="vc-phone"
                type="tel"
                value={vcard.phone}
                onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="vc-email">Email</Label>
              <Input
                id="vc-email"
                type="email"
                value={vcard.email}
                onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="vc-web">Website</Label>
              <Input
                id="vc-web"
                type="url"
                value={vcard.website}
                onChange={(e) =>
                  setVcard({ ...vcard, website: e.target.value })
                }
              />
            </div>
          </div>
        ) : null}

        {tooLong ? (
          <p role="alert" className="text-sm text-danger">
            That&apos;s too much content for a reliable QR code — shorten it
            below {MAX_LEN} characters.
          </p>
        ) : null}

        <DesignControls design={design} onChange={setDesign} />
      </div>

      <div>
        <Card className="p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-ink-soft">
            Your code
          </p>
          <QRPreview data={ready ? payload : ""} options={design} />
          <div className="mt-4 flex justify-center gap-2">
            <Button
              type="button"
              disabled={!ready}
              onClick={async () => {
                setDownloadError(null);
                try {
                  await downloadPng(payload, design, "scanstone-qr");
                } catch {
                  setDownloadError("Download failed — try another browser.");
                }
              }}
            >
              PNG
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={!ready}
              onClick={() => {
                setDownloadError(null);
                try {
                  downloadSvg(payload, design, "scanstone-qr");
                } catch {
                  setDownloadError("Download failed — try another browser.");
                }
              }}
            >
              SVG
            </Button>
          </div>
          {downloadError ? (
            <p role="alert" className="mt-2 text-center text-xs text-danger">
              {downloadError}
            </p>
          ) : null}
          <p className="mt-3 text-center text-xs leading-relaxed text-ink-faint">
            Free forever. The content lives inside the code itself — nothing to
            expire, no account, no watermark.
          </p>
        </Card>

        {mode === "url" ? (
          <Card className="mt-4 border-verdigris/30 bg-verdigris/5 p-5">
            <p className="text-sm leading-relaxed text-ink">
              <strong>Printing this?</strong> A static code can&apos;t be edited
              later. A{" "}
              <Link
                href="/signup"
                className="font-medium text-verdigris-deep underline"
              >
                dynamic code
              </Link>{" "}
              lets you change the destination after printing and counts your
              scans — and it keeps redirecting even if you cancel. 3 free.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
