import { defineModule } from "@/core/modules/define";
import * as schema from "./db/schema";
import { seedAffiliateMarketing } from "./db/seed";

export const affiliateMarketing = defineModule({
  id: "affiliate-marketing",
  schema,
  seed: (db, workspaceId) => seedAffiliateMarketing(db, workspaceId),
});
