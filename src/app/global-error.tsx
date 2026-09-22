"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "system-ui" }}>
          <div style={{ textAlign: "center" }}>
            <h2>Something went wrong!</h2>
            <button onClick={() => reset()} style={{ marginTop: 16, padding: "8px 16px", cursor: "pointer" }}>Try again</button>
          </div>
        </div>
      </body>
    </html>
  );
}
