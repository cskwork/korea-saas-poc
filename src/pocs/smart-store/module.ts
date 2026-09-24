import { defineModule } from "@/core/modules/define";
import * as schema from "./db/schema";
import { seedSmartStore } from "./db/seed";

/** 스마트셀러: Naver SmartStore consignment (위탁판매) operations console. */
export const smartStore = defineModule({
  id: "smart-store",
  schema,
  seed: (db, workspaceId) => seedSmartStore(db, workspaceId),
});
