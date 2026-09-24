import Link from "next/link";
import { MODULES } from "@/pocs/registry";

// Placeholder hub; replaced by the designed catalogue.
export default function HubPage() {
  return (
    <main style={{ padding: 32 }}>
      <h1>한국형 1인 SaaS 10선</h1>
      <ol>
        {MODULES.map((m) => (
          <li key={m.slug}>
            <Link href={`/${m.slug}`}>{m.name}</Link> — {m.tagline}
          </li>
        ))}
      </ol>
    </main>
  );
}
