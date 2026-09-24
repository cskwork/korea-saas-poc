import { defineModule } from "@/core/modules/define";
import * as schema from "./db/schema";
import { seedDemo } from "./db/seed";

/** DevFlow: the business side of a Korean freelance developer (Postgres schema `dev_freelancing`). */
export const devFreelancing = defineModule({
  id: "dev-freelancing",
  schema,
  seed: (db, workspaceId) => seedDemo(db, workspaceId),
});
