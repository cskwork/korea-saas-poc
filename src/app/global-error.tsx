"use client";

/** Last-resort boundary for errors in the root layout. Must render its own <html>. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#dde2de", color: "#16202b", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 480, padding: 32 }}>
          <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>일시적인 문제가 생겼어요</h1>
          <p style={{ lineHeight: 1.6, margin: "0 0 24px" }}>잠시 후 다시 시도해 주세요. 문제가 계속되면 새로고침해 주세요.</p>
          <button type="button" onClick={reset} style={{ padding: "12px 18px", border: 0, background: "#0d5a44", color: "#fff", fontWeight: 700 }}>
            다시 시도
          </button>
        </main>
      </body>
    </html>
  );
}
