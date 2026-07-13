import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Scanstone — QR codes that keep working. Set in stone.";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#f7f3ea",
        padding: 72,
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "#1c1917",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M6.5 7.5h5v5h-5z"
                stroke="#f7f3ea"
                strokeWidth="1.4"
                fill="none"
              />
              <rect x="14.5" y="7.5" width="2" height="2" fill="#2c6e63" />
              <rect x="6.5" y="15" width="2" height="2" fill="#f7f3ea" />
              <rect x="10" y="15" width="6.5" height="2" fill="#2c6e63" />
            </svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, color: "#1c1917" }}>
            Scanstone
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 600,
              color: "#1c1917",
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            Print it once.
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 600,
              color: "#2c6e63",
              lineHeight: 1.05,
              letterSpacing: "-2px",
            }}
          >
            Change it forever.
          </div>
        </div>

        <div style={{ fontSize: 30, color: "#4f4a42" }}>
          QR codes that never expire — free generator + editable dynamic codes
        </div>
      </div>

      <div
        style={{
          width: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 200,
            height: 260,
            background: "#ece5d3",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 24px 48px rgba(28,25,23,0.25)",
            borderBottom: "10px solid #2c6e63",
          }}
        >
          <svg width="150" height="150" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z"
              stroke="#1c1917"
              strokeWidth="1.6"
              fill="none"
            />
            <rect x="6" y="6" width="2" height="2" fill="#1c1917" />
            <rect x="16" y="6" width="2" height="2" fill="#1c1917" />
            <rect x="6" y="16" width="2" height="2" fill="#1c1917" />
            <rect x="13" y="13" width="2.4" height="2.4" fill="#2c6e63" />
            <rect x="17" y="13" width="2.4" height="2.4" fill="#1c1917" />
            <rect x="13" y="17" width="2.4" height="2.4" fill="#1c1917" />
            <rect x="17" y="17" width="2.4" height="2.4" fill="#2c6e63" />
          </svg>
        </div>
      </div>
    </div>,
    size,
  );
}
