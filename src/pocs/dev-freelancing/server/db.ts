import type { Database } from "@/core/db/connection";
import type * as schema from "../db/schema";

/** The module's drizzle handle (query builder + `db.query.*` for the dev_freelancing schema). */
export type Db = Database<typeof schema>;
