import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1c1917",
        borderRadius: 96,
      }}
    >
      <svg width="360" height="360" viewBox="0 0 24 24" fill="none">
        <path
          d="M6.5 7.5h5v5h-5z"
          stroke="#f7f3ea"
          strokeWidth="1.4"
          fill="none"
        />
        <rect x="8.2" y="9.2" width="1.6" height="1.6" fill="#f7f3ea" />
        <rect x="14.5" y="7.5" width="2" height="2" fill="#2c6e63" />
        <rect x="14.5" y="11" width="2" height="2" fill="#f7f3ea" />
        <rect x="6.5" y="15" width="2" height="2" fill="#f7f3ea" />
        <rect x="10" y="15" width="6.5" height="2" fill="#2c6e63" />
      </svg>
    </div>,
    size,
  );
}
