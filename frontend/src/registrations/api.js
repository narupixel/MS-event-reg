const API_BASE_URL = "/api";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error(
      "The registration service is unavailable. Start the backend and try again.",
    );
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(body.error ?? "The registration request failed.");
    error.details = body.details;
    throw error;
  }

  return body;
}

export function createRegistrationApi() {
  return Object.freeze({
    async create(registration, event) {
      return request("/registrations", {
        method: "POST",
        body: JSON.stringify({ ...registration, event }),
      });
    },
    async countAllByEvent(eventId) {
      const registrations = await request("/registrations");
      return registrations.filter((registration) => registration.eventId === eventId).length;
    },
    async countByEvent(eventId) {
      const registrations = await request("/registrations");
      return registrations.filter(
        (registration) =>
          registration.eventId === eventId && registration.status !== "canceled",
      ).length;
    },
    async find(id) {
      const registrations = await request("/registrations");
      return registrations.find((registration) => registration.id === id) ?? null;
    },
    async list() {
      return request("/registrations");
    },
    async update(registration) {
      if (registration.status === "canceled") {
        return request(`/registrations/${encodeURIComponent(registration.id)}/cancel`, {
          method: "PATCH",
        });
      }

      return registration;
    },
    async remove(id) {
      return request(`/registrations/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  });
}
