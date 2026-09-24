import type { Database } from "@/core/db/connection";
import type * as schema from "./schema";

/** A drizzle instance bound to the smart-store schema (request or test database). */
export type SmartStoreDb = Database<typeof schema>;
