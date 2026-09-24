import type { Database } from "@/core/db/connection";
import type { schema } from "./schema";

/** The module's drizzle database (a transaction works too). */
export type Db = Database<typeof schema>;
