# Event Registry

A focused browser application with a manager workspace for creating events and
managing registrations, plus a separate public-facing attendee experience.

[Open the live demo](https://narupixel.github.io/MS1-event-reg/)

## Implementation status

The frontend MVP supports the complete event-registration demonstration:

- Manager can create, inspect, edit, publish, close, and remove events.
- Attendees can browse available events, enter and review their details,
	confirm one place, and receive a registration reference.
- Manager can review registrations, cancel them, and remove canceled records.
- Manager routes use a workspace sidebar, while attendee routes use a standalone
	public header.
- Shared modals protect consequential actions and dismissible toasts provide
	brief feedback.

The feature modules validate event lifecycle, capacity, attendee data, and
removal safety before updating their stores.

## Demo login

- Username: `agent`
- Password: `1234`

These credentials are for the local demo only and are defined in
`frontend/src/shared/auth.js`.

This version provides one manager account. It currently does not support creating or
managing additional manager accounts but should do so in future expansions.

## Run locally

The Milestone 2 version uses an Express backend for persistent attendee
registrations. Node.js and npm are required.

From the repository root:

```bash
npm install
npm start
```

Then open <http://localhost:8000/#events> for the manager workspace. The
backend serves the frontend and exposes the registration API under
`/api/registrations`.

Registration records are stored in `backend/data/registrations.json` and remain
available after the server restarts. This JSON file is intentionally used as a
beginner-friendly persistence layer for the first backend feature; it can be
replaced by SQLite or another database in a later milestone.

## Demo workflow

Keep the demonstration in one browser so the connected sample data remains
available:

1. Sign in and create a future event.
2. Publish the event, then select **Preview attendee page**.
3. Register an attendee and confirm the registration.
4. Select **Manager workspace** in the public header.
5. Open **Registrations** to show the new record and updated availability.

Event data remains local to the browser for the current milestone. Attendee
registrations are now sent to the Express backend and persist in
`backend/data/registrations.json`. The app does not send email or process
payments.

## Main routes

- `#login` - manager sign-in
- `#events` - create and manage events
- `#registrations` - review registrations
- `#register` - public attendee registration page

## Workflows and CRUD ownership

- Manager: Events -> Event detail -> Create or edit -> Publish or close -> Remove
- Handoff: Events -> Preview attendee page
- Attendee: Registration page -> Event -> Attendee details -> Review -> Confirmation
- Registration management: Registrations -> Cancel -> Remove canceled record

The feature modules keep business rules together:

| Operation | Events | Registrations |
| --- | --- | --- |
| Create | `events/service.js` | `registrations/service.js` |
| Read | `events/service.js` | `registrations/service.js` |
| Update | `events/service.js` | `registrations/service.js` |
| Delete | `events/service.js` | `registrations/service.js` |

Within each feature, `model.js` validates records, `service.js` applies
user-facing rules, and `store.js` manages in-memory data. The usual flow is:
screen input -> service rules -> model validation -> store update -> screen
render.

## Tests

Run the Node test suite from the repository root:

```bash
npm test
```

The tests cover event and registration rules, availability, removal
protection, route mapping, API validation, persistence, and capacity
protection.

## Milestone 2 backend feature

The first backend-supported feature is persistent attendee registration:

1. The attendee completes the existing registration form.
2. The frontend sends the event ID, attendee name, email, and event context to
   `POST /api/registrations`.
3. The backend validates the input, event status, schedule, and capacity.
4. The backend stores the confirmed registration and returns its ID and
   timestamp.
5. The manager registration view retrieves records from
   `GET /api/registrations`.

The API also supports canceling and removing canceled records. A serialized
write queue prevents simultaneous requests from exceeding event capacity.

### Milestone 2 testing scenarios

The backend test suite covers:

- valid attendee registration and normalized email storage
- invalid name and email input
- full-event rejection
- retrieval of stored records after the API writes them
- cancellation and deletion rules through the API

The frontend displays a service-unavailable message when the backend cannot be
reached, and displays the API's validation message when a registration is
rejected.

## Assignment coverage

The implementation includes semantic HTML for navigation, forms, lists, and
status messages; responsive CSS split into foundation and feature files; and
JavaScript interactions for validation, conditional event states, and both
manager and attendee workflows.

Before submission, manually review keyboard navigation, the accessibility tree,
browser console, 200% zoom, and narrow, tablet, and desktop layouts. Complete
the team's workflow worksheet, AI use statements, final review, and repository
link checks as required by the assignment.

## Project structure

```text
frontend/
|-- assets/
|-- index.html
|-- tests/
|   |-- events.test.js
|   |-- registrations.test.js
|   `-- routes.test.js
|-- src/
|   |-- main.js
|   |-- events/
|   |-- registrations/
|   |-- shared/
|   `-- styles/
```

- `frontend/index.html` contains the application shell and view markup.
- `frontend/src/main.js` creates the stores, connects the features, and starts
	routing and shared interface helpers.
- `frontend/src/events/` owns event validation, CRUD operations, sample data,
	and manager and attendee event screens.
- `frontend/src/registrations/` owns attendee validation, registration CRUD,
	and registration screens.
- `frontend/src/shared/` contains reusable authentication, routing, shell, DOM,
	formatting, and feedback helpers.
- `frontend/src/styles/` contains design tokens, layout, form, feature, and
	feedback styles.
- `frontend/tests/` verifies route, event, and registration behavior.

## Design principles

- Adaptive monochrome visual system with clear states and comfortable targets.
- Semantic structure, visible keyboard focus, and reduced-motion support.
- Compact manager navigation that becomes horizontal on smaller screens.
- No database or API is required for Milestone 1; data remains local to the
	current browser and is not shared with a backend.

## Repository

- [Demo page](https://narupixel.github.io/MS1-event-reg/)
- [Issues](https://github.com/jatsia/event-reg-final/issues)