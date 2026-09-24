import { defineModule } from "@/core/modules/define";
import * as schema from "./db/schema";
import { seedStudio } from "./db/seed";

export const aiDesignVideo = defineModule({
  id: "ai-design-video",
  schema,
  seed: (db, workspaceId) => seedStudio(db, workspaceId),
});
