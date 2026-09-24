import { defineModule } from "@/core/modules/define";
import { schema } from "./db/schema";
import { seedOnlineEducation } from "./db/seed";

/** 에듀마켓: courses with a curriculum builder, a school storefront, digital products and revenue. */
export const onlineEducation = defineModule({
  id: "online-education",
  schema,
  seed: (db, workspaceId) => seedOnlineEducation(db, workspaceId),
});

export const BASE_PATH = "/online-education";
