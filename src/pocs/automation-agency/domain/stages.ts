import type { MaintenanceStatus, Stage } from "../db/schema";

/** Delivery stages, in travel order: the stations of the delivery line. */
export const STAGES = [
  "waiting",
  "analysis",
  "development",
  "testing",
  "deployment",
  "maintenance",
] as const satisfies readonly Stage[];

export const STAGE_LABEL: Record<Stage, string> = {
  waiting: "대기",
  analysis: "분석",
  development: "개발",
  testing: "테스트",
  deployment: "배포",
  maintenance: "유지보수",
};

/** Station codes printed on the map, like platform numbers. */
export const STAGE_CODE: Record<Stage, string> = {
  waiting: "B1",
  analysis: "B2",
  development: "B3",
  testing: "B4",
  deployment: "B5",
  maintenance: "L0",
};

/** Progress the project is set to when it arrives at a stage (the operator can adjust it afterwards). */
export const STAGE_ARRIVAL_PROGRESS: Record<Stage, number> = {
  waiting: 0,
  analysis: 15,
  development: 40,
  testing: 75,
  deployment: 90,
  maintenance: 100,
};

/** Stages before maintenance: the delivery line proper. */
export const DELIVERY_STAGES = STAGES.filter((stage) => stage !== "maintenance");

export function stageIndex(stage: Stage): number {
  return STAGES.indexOf(stage);
}

export function nextStage(stage: Stage): Stage | undefined {
  return STAGES[stageIndex(stage) + 1];
}

export interface StageMove {
  stage: Stage;
  progress: number;
  maintenanceStatus: MaintenanceStatus;
  maintenanceStartedOn: string | null;
}

/**
 * Moves a project to the next station. Arriving at 유지보수 starts the
 * maintenance subscription on `today` unless it is already running.
 */
export function advanceStage(
  current: { stage: Stage; maintenanceStatus: MaintenanceStatus; maintenanceStartedOn: string | null },
  today: string,
): StageMove | undefined {
  const stage = nextStage(current.stage);
  if (!stage) return undefined;
  const joinsLoop = stage === "maintenance";
  return {
    stage,
    progress: STAGE_ARRIVAL_PROGRESS[stage],
    maintenanceStatus: joinsLoop && current.maintenanceStatus !== "active" ? "active" : current.maintenanceStatus,
    maintenanceStartedOn: joinsLoop ? (current.maintenanceStartedOn ?? today) : current.maintenanceStartedOn,
  };
}
