import { defineModule } from "@/core/modules/define";
import * as schema from "./db/schema";
import { seedAgency } from "./db/seed";

/** 글품: AI-drafted, editor-reviewed content orders for small businesses. */
export const contentAgency = defineModule({
  id: "ai-content-agency",
  schema,
  seed: (db, workspaceId) => seedAgency(db, workspaceId),
});
