"use client";

import { useState } from "react";
import { Frame, type FrameProps } from "./Frame";

/**
 * A frame that inks itself when its stage changes (never on first render):
 * the signature moment of the sheet.
 */
export function InkFrame(props: Omit<FrameProps, "inking">) {
  const [seen, setSeen] = useState({ medium: props.medium, inks: 0 });
  // Adjusting state while rendering (React's "previous props" pattern): a new stage replays the draw.
  if (seen.medium !== props.medium) setSeen({ medium: props.medium, inks: seen.inks + 1 });
  return <Frame key={seen.inks} {...props} inking={seen.inks > 0} />;
}
