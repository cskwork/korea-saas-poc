import { defineModule } from "@/core/modules/define";
import * as schema from "./db/schema";
import { seed } from "./db/seed";

export const newsletterCommunity = defineModule({
  id: "newsletter-community",
  schema,
  seed,
});
