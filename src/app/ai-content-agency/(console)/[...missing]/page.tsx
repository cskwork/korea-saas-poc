import { notFound } from "next/navigation";

/** Unknown addresses under the module get the module's own 404, inside its shell. */
export default function MissingPage() {
  notFound();
}
