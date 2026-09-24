import type { ReactNode } from "react";
import ui from "./ui.module.css";

/** The ledger's own 1.6px-stroke icon set (square-ended forms, drawn on a 24 grid). */
const PATHS = {
  book: (
    <>
      <path d="M4 4.5h11a3 3 0 0 1 3 3V20H7a3 3 0 0 1-3-3z" />
      <path d="M4 17a3 3 0 0 1 3-3h11" />
      <path d="M8 8h6M8 11h4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17.5h2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M15.5 5.3a3.3 3.3 0 0 1 0 6.4M17.5 14.8c2 .6 3.5 2.4 3.5 5.2" />
    </>
  ),
  chat: <path d="M12 4.5c4.7 0 8.5 2.9 8.5 6.5s-3.8 6.5-8.5 6.5c-.8 0-1.6-.1-2.3-.2L5.5 20l.8-3.8C4.8 15 3.5 13.1 3.5 11c0-3.6 3.8-6.5 8.5-6.5z" />,
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  won: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" />
      <path d="M7 9l1.8 6L10.5 10h3l1.7 5L17 9M6.5 12.2h11" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <rect x="13" y="4.5" width="4" height="5" />
      <rect x="7" y="14.5" width="4" height="5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  left: <path d="M14.5 6l-6 6 6 6" />,
  right: <path d="M9.5 6l6 6-6 6" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  reset: (
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.3-5.4" />
      <path d="M4.5 4.5v4h4" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11" height="11" />
      <path d="M15.5 8.5v-4h-11v11h4" />
    </>
  ),
  phone: (
    <path d="M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2z" />
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  pencil: (
    <>
      <path d="M15.5 4.5l4 4L9 19H5v-4z" />
      <path d="M13 7l4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 7h15M9.5 7V4.5h5V7" />
      <path d="M6.5 7l1 12.5h9l1-12.5M10.5 11v5M13.5 11v5" />
    </>
  ),
  out: (
    <>
      <path d="M13.5 5.5h5v5M18.5 5.5l-7.5 7.5" />
      <path d="M16.5 14v4.5h-11v-11H10" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, className, label }: { name: IconName; className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ? `${ui.icon} ${className}` : ui.icon}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
