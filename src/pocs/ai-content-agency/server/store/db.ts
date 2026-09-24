import type { Database } from "@/core/db/connection";
import type * as schema from "../../db/schema";

/** The module's database handle. Store functions take it (plus the workspace id) explicitly so tests can call them. */
export type Db = Database<typeof schema>;
