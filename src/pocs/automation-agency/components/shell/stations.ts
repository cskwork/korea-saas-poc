export const BASE_PATH = "/automation-agency";

export interface Station {
  href: string;
  label: string;
  /** Romanised sub-label, as metro signs print under the Hangul name. */
  en: string;
}

/** The module's pages as stations on one line, in navigation order. */
export const STATIONS: readonly Station[] = [
  { href: BASE_PATH, label: "운행 현황", en: "Network" },
  { href: `${BASE_PATH}/catalog`, label: "솔루션", en: "Solutions" },
  { href: `${BASE_PATH}/roi`, label: "ROI 진단", en: "ROI" },
  { href: `${BASE_PATH}/workflows`, label: "워크플로", en: "Workflows" },
  { href: `${BASE_PATH}/projects`, label: "프로젝트", en: "Projects" },
  { href: `${BASE_PATH}/quotes`, label: "견적", en: "Quotes" },
  { href: `${BASE_PATH}/pricing`, label: "요금제", en: "Plans" },
];

/** Index of the station a pathname belongs to (the deepest matching prefix). */
export function currentStationIndex(pathname: string): number {
  let best = 0;
  STATIONS.forEach((station, index) => {
    if (index > 0 && (pathname === station.href || pathname.startsWith(`${station.href}/`))) best = index;
  });
  return best;
}
