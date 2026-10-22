import { createElement } from "./dom.js";

export function createEventStatus(status, { full = false } = {}) {
  const displayStatus = full ? "full" : status;
  const labelText =
    ["full", "closed"].includes(displayStatus)
      ? displayStatus.toUpperCase()
      : displayStatus[0].toUpperCase() + displayStatus.slice(1);
  const label = createElement(
    "span",
    `event-status event-status-${displayStatus}`,
    labelText,
  );

  label.prepend(createElement("span", "status-mark"));

  return label;
}
