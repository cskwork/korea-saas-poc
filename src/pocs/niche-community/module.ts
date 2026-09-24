import { defineModule } from "@/core/modules/define";
import { schema } from "./db/schema";
import { seedCommunity } from "./db/seed";

/** 스타트업 빌더스: a paid niche community for early-stage founders, run by one operator. */
export const nicheCommunity = defineModule({
  id: "niche-community",
  schema,
  seed: (db, workspaceId) => seedCommunity(db, workspaceId),
});
