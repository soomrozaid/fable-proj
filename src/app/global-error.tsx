"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#f7f3ea",
          color: "#1c1917",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: 12, color: "#4f4a42" }}>
            Redirects for printed codes are unaffected. {error.digest ?? ""}
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              background: "#1c1917",
              color: "#f7f3ea",
              borderRadius: 6,
              border: 0,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
