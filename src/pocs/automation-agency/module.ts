import { defineModule } from "@/core/modules/define";
import { schema } from "./db/schema";
import { seedAutomationAgency } from "./db/seed";

export const automationAgency = defineModule({
  id: "automation-agency",
  schema,
  seed: (db, workspaceId) => seedAutomationAgency(db, workspaceId),
});
