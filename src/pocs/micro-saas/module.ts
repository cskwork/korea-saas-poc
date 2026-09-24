import { defineModule } from "@/core/modules/define";
import { schema } from "./db/schema";
import { seedMicroSaas } from "./db/seed";

export const microSaasModule = defineModule({
  id: "micro-saas",
  schema,
  seed: seedMicroSaas,
});
