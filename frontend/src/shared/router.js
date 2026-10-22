import {
  DEFAULT_ROUTE,
  getNavigationRoute,
  MANAGER_ROUTE_IDS,
  PUBLIC_ROUTE_IDS,
  renderShell,
  ROUTE_IDS,
} from "./shell.js";
import { AUTH_ROUTE } from "./auth.js";

export function resolveRoute(requestedRoute, isReady = true, isAuthenticated = true) {
  if (
    !isAuthenticated &&
    (requestedRoute === AUTH_ROUTE ||
      MANAGER_ROUTE_IDS.includes(requestedRoute) ||
      !PUBLIC_ROUTE_IDS.includes(requestedRoute))
  ) {
    return AUTH_ROUTE;
  }

  if (requestedRoute === AUTH_ROUTE) {
    return DEFAULT_ROUTE;
  }

  if (!ROUTE_IDS.includes(requestedRoute)) {
    return DEFAULT_ROUTE;
  }

  return isReady ? requestedRoute : getNavigationRoute(requestedRoute);
}

function getRoute(isAuthenticated, onAuthenticationRequired) {
  const requestedRoute = window.location.hash.slice(1).split("/")[0];
  const authenticated = isAuthenticated();

  if (
    !authenticated &&
    requestedRoute !== AUTH_ROUTE &&
    !PUBLIC_ROUTE_IDS.includes(requestedRoute)
  ) {
    onAuthenticationRequired();
  }

  const isReady =
    !ROUTE_IDS.includes(requestedRoute) ||
    document.querySelector(`[data-view="${requestedRoute}"]`)?.dataset.ready !==
      "false";

  return resolveRoute(requestedRoute, isReady, authenticated);
}

function renderRoute(route) {
  const navigationRoute = getNavigationRoute(route);

  renderShell(route);

  document.querySelectorAll("[data-view]").forEach((view) => {
    view.hidden = view.dataset.view !== route;
  });

  document.querySelectorAll("[data-route]").forEach((link) => {
    if (link.dataset.route === navigationRoute) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const heading = document.querySelector(`[data-view="${route}"] h1`);
  document.title = `${heading.textContent} | Event Registry`;
}

export function initializeRouter({
  isAuthenticated = () => true,
  onAuthenticationRequired = () => {},
} = {}) {
  const renderCurrentRoute = () =>
    renderRoute(getRoute(isAuthenticated, onAuthenticationRequired));

  window.addEventListener("hashchange", renderCurrentRoute);
  renderCurrentRoute();
}
