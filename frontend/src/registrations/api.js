const API_BASE_URL = "/api";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    const error = new Error(
      "The registration service is unavailable. Start the backend and try again.",
    );
    error.code = "API_UNAVAILABLE";
    throw error;
  }

  const responseText = await response.text();
  let body;

  try {
    body = responseText ? JSON.parse(responseText) : {};
  } catch {
    const error = new Error(
      "The registration service is unavailable. Start the backend and try again.",
    );
    error.code = "API_UNAVAILABLE";
    throw error;
  }

  if (!response.ok) {
    const error = new Error(body.error ?? "The registration request failed.");
    error.details = body.details;
    throw error;
  }

  return body;
}

export function createRegistrationApi({ fallback } = {}) {
  async function withFallback(operation, fallbackOperation) {
    try {
      return await operation();
    } catch (error) {
      if (error?.code !== "API_UNAVAILABLE" || !fallback) {
        throw error;
      }

      return fallbackOperation();
    }
  }

  return Object.freeze({
    async create(registration, event) {
      return withFallback(() =>
        request("/registrations", {
          method: "POST",
          body: JSON.stringify({ ...registration, event }),
        }),
        () => fallback.create(registration),
      );
    },
    async countAllByEvent(eventId) {
      const registrations = await withFallback(
        () => request("/registrations"),
        () => fallback.list(),
      );
      return registrations.filter((registration) => registration.eventId === eventId).length;
    },
    async countByEvent(eventId) {
      const registrations = await withFallback(
        () => request("/registrations"),
        () => fallback.list(),
      );
      return registrations.filter(
        (registration) =>
          registration.eventId === eventId && registration.status !== "canceled",
      ).length;
    },
    async find(id) {
      const registrations = await withFallback(
        () => request("/registrations"),
        () => fallback.list(),
      );
      return registrations.find((registration) => registration.id === id) ?? null;
    },
    async list() {
      return withFallback(() => request("/registrations"), () => fallback.list());
    },
    async update(registration) {
      if (registration.status === "canceled") {
        return withFallback(() =>
          request(`/registrations/${encodeURIComponent(registration.id)}/cancel`, {
            method: "PATCH",
          }),
          () => fallback.update(registration),
        );
      }

      return registration;
    },
    async remove(id) {
      return withFallback(() =>
        request(`/registrations/${encodeURIComponent(id)}`, {
          method: "DELETE",
        }),
        () => fallback.remove(id),
      );
    },
  });
}
