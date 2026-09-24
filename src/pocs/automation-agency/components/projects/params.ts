import { STAGES } from "../../domain/stages";
import type { ProjectFilter } from "../../server/data/projects";
import { oneOf, param, type SearchParams } from "../params";

export function parseProjectFilter(params: SearchParams): ProjectFilter {
  return {
    stage: oneOf(params, "stage", STAGES),
    q: param(params, "q")?.slice(0, 60) || undefined,
    sort: oneOf(params, "sort", ["due", "recent", "client"] as const),
  };
}
