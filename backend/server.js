import express from "express";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DATA_DIRECTORY = path.join(ROOT, "backend", "data");
const REGISTRATIONS_FILE = path.join(DATA_DIRECTORY, "registrations.json");
const PORT = Number(process.env.PORT ?? 8000);
let registrationWriteQueue = Promise.resolve();

const seedEvents = new Map([
  [
    "community-design-meetup",
    {
      id: "community-design-meetup",
      title: "Community Design Meetup",
      startsAt: "2026-12-18T14:00:00+08:00",
      capacity: 80,
      status: "published",
    },
  ],
  [
    "frontend-study-session",
    {
      id: "frontend-study-session",
      title: "Frontend Study Session",
      startsAt: "2026-11-07T10:00:00+08:00",
      capacity: 40,
      status: "draft",
    },
  ],
]);

const app = express();
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(ROOT, "frontend")));

async function readRegistrations() {
  try {
    return JSON.parse(await fs.readFile(REGISTRATIONS_FILE, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    await writeRegistrations([]);
    return [];
  }
}

async function writeRegistrations(registrations) {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  await fs.writeFile(
    REGISTRATIONS_FILE,
    `${JSON.stringify(registrations, null, 2)}\n`,
    "utf8",
  );
}

function withRegistrationWriteLock(operation) {
  const next = registrationWriteQueue.then(operation, operation);
  registrationWriteQueue = next.catch(() => {});
  return next;
}

function getEvent(eventId, event) {
  const seededEvent = seedEvents.get(eventId);
  if (seededEvent) {
    return seededEvent;
  }

  if (
    event &&
    event.id === eventId &&
    typeof event.capacity === "number" &&
    typeof event.startsAt === "string" &&
    typeof event.status === "string"
  ) {
    return event;
  }

  return null;
}

function activeCount(registrations, eventId) {
  return registrations.filter(
    (registration) =>
      registration.eventId === eventId && registration.status === "confirmed",
  ).length;
}

function validateRequest(body, event, registrations) {
  const errors = {};
  const attendeeName = String(body.attendeeName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!attendeeName) {
    errors.attendeeName = "Your name is required.";
  } else if (attendeeName.length > 100) {
    errors.attendeeName = "Your name must be 100 characters or fewer.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  } else if (email.length > 254) {
    errors.email = "Your email must be 254 characters or fewer.";
  }

  if (!event || event.status !== "published") {
    errors.event = "This event is not currently open for registration.";
  } else if (Date.parse(event.startsAt) <= Date.now()) {
    errors.event = "Registration has closed for this event.";
  } else if (activeCount(registrations, event.id) >= event.capacity) {
    errors.event = "This event has reached capacity.";
  }

  return { errors, attendeeName, email };
}

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/registrations", async (_request, response, next) => {
  try {
    response.json(await readRegistrations());
  } catch (error) {
    next(error);
  }
});

app.post("/api/registrations", async (request, response, next) => {
  try {
    await withRegistrationWriteLock(async () => {
      const body = request.body ?? {};
      const eventId = String(body.eventId ?? "").trim();
      const registrations = await readRegistrations();
      const event = getEvent(eventId, body.event);
      const { errors, attendeeName, email } = validateRequest(
        body,
        event,
        registrations,
      );

      if (Object.keys(errors).length > 0) {
        response.status(422).json({
          error: "The registration could not be completed.",
          details: errors,
        });
        return;
      }

      const registration = {
        id: crypto.randomUUID(),
        eventId,
        attendeeName,
        email,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };
      registrations.push(registration);
      await writeRegistrations(registrations);
      response.status(201).json(registration);
    });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/registrations/:id/cancel", async (request, response, next) => {
  try {
    await withRegistrationWriteLock(async () => {
      const registrations = await readRegistrations();
      const index = registrations.findIndex(
        (registration) => registration.id === request.params.id,
      );

      if (index < 0) {
        response.status(404).json({ error: "The registration could not be found." });
        return;
      }

      registrations[index] = { ...registrations[index], status: "canceled" };
      await writeRegistrations(registrations);
      response.json(registrations[index]);
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/registrations/:id", async (request, response, next) => {
  try {
    await withRegistrationWriteLock(async () => {
      const registrations = await readRegistrations();
      const registration = registrations.find(
        (candidate) => candidate.id === request.params.id,
      );

      if (!registration) {
        response.status(404).json({ error: "The registration could not be found." });
        return;
      }

      if (registration.status !== "canceled") {
        response.status(409).json({
          error: "Cancel the registration before removing its record.",
        });
        return;
      }

      await writeRegistrations(
        registrations.filter((candidate) => candidate.id !== request.params.id),
      );
      response.json(registration);
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "The server could not complete the request." });
});

export { app, readRegistrations, writeRegistrations, REGISTRATIONS_FILE };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`Event Registry backend listening on http://localhost:${PORT}`);
  });
}
