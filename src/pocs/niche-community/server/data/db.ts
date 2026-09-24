import type { Database } from "@/core/db/connection";
import type { schema } from "../../db/schema";

/** The module's database handle: data functions take `(db, workspaceId, …)` so tests can call them directly. */
export type Db = Database<typeof schema>;
