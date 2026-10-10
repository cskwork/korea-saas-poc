"use client";

import { createContext, useContext } from "react";
import {
  createOrderAction,
  deleteCaseAction,
  deleteDraftAction,
  deleteInquiryAction,
  deleteOrderAction,
  draftFromOrderAction,
  editDraftAction,
  generateDraftAction,
  inquiryAction,
  linkDraftAction,
  moveOrderAction,
  publishCaseAction,
  regenerateDraftAction,
  restoreVersionAction,
  resetDemoAction,
  selectPlanAction,
  updateCaseAction,
  updateOrderAction,
} from "../server/actions";

/** The original server actions (Next.js server-action references). Components use these unless a DemoProvider says otherwise. */
const serverActions = {
  createOrderAction,
  updateOrderAction,
  moveOrderAction,
  deleteOrderAction,
  draftFromOrderAction,
  generateDraftAction,
  regenerateDraftAction,
  editDraftAction,
  restoreVersionAction,
  linkDraftAction,
  deleteDraftAction,
  publishCaseAction,
  deleteCaseAction,
  updateCaseAction,
  selectPlanAction,
  inquiryAction,
  deleteInquiryAction,
  resetDemoAction,
};

/** Every mutation the module's components can run. The browser demo supplies the same names and signatures. */
export type GeulpumActions = typeof serverActions;

const ActionsContext = createContext<GeulpumActions>(serverActions);

/** Inside this provider the components run `actions` (the browser demo) instead of the server actions. */
export function DemoProvider({ actions, children }: { actions: GeulpumActions; children: React.ReactNode }) {
  return <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>;
}

/** The action set for this subtree: server actions by default, browser demo actions inside a DemoProvider. */
export function useGeulpumActions(): GeulpumActions {
  return useContext(ActionsContext);
}
