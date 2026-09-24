import type { Role, Tier } from "../domain/rules";

/** "운영자" / "프리미엄" / "무료" — how a persona's standing is named everywhere. */
export function personaLabel(person: { role: Role; tier: Tier }): string {
  if (person.role === "operator") return "운영자";
  return person.tier === "premium" ? "프리미엄" : "무료";
}
