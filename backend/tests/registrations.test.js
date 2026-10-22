import test from "node:test";
import assert from "node:assert/strict";
import { app, readRegistrations, writeRegistrations } from "../server.js";

const testEvent = {
  id: "test-event",
  title: "Test Event",
  startsAt: "2027-01-10T10:00:00+08:00",
  capacity: 1,
  status: "published",
};

let server;
let baseUrl;

test.before(async () => {
  await writeRegistrations([]);
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  await writeRegistrations([]);
});

test("stores a valid registration and returns it later", async () => {
  const createResponse = await fetch(`${baseUrl}/api/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventId: testEvent.id,
      event: testEvent,
      attendeeName: "Ada Lovelace",
      email: "ADA@example.com",
    }),
  });
  const registration = await createResponse.json();

  assert.equal(createResponse.status, 201);
  assert.equal(registration.email, "ada@example.com");

  const listResponse = await fetch(`${baseUrl}/api/registrations`);
  const registrations = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.deepEqual(registrations, [registration]);
  assert.deepEqual(await readRegistrations(), [registration]);
});

test("rejects invalid input and prevents a full event from overbooking", async () => {
  const invalidResponse = await fetch(`${baseUrl}/api/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventId: testEvent.id,
      event: testEvent,
      attendeeName: "",
      email: "not-an-email",
    }),
  });
  const invalidBody = await invalidResponse.json();
  assert.equal(invalidResponse.status, 422);
  assert.equal(invalidBody.details.attendeeName, "Your name is required.");

  const fullResponse = await fetch(`${baseUrl}/api/registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventId: testEvent.id,
      event: testEvent,
      attendeeName: "Grace Hopper",
      email: "grace@example.com",
    }),
  });
  const fullBody = await fullResponse.json();
  assert.equal(fullResponse.status, 422);
  assert.equal(fullBody.details.event, "This event has reached capacity.");
});
