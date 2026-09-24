import "server-only";
import { cache } from "react";
import { getModuleContext } from "@/core/modules/context";
import { nicheCommunity } from "../module";
import { loadViewer } from "./data/viewer";

/**
 * The tenant's database handle plus the demo persona the visitor is wearing.
 * Actions call `openCommunity` (never cached: a mutation may change the persona);
 * renders share one `getCommunity` per request.
 */
export async function openCommunity() {
  const { db, workspaceId } = await getModuleContext(nicheCommunity);
  const viewer = await loadViewer(db, workspaceId);
  return { db, workspaceId, viewer };
}

export const getCommunity = cache(openCommunity);
