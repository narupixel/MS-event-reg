# Event Registry

A focused browser application with a manager workspace for creating events and
managing registrations, plus a separate public-facing attendee experience.

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

## Milestone 2 implementation summary

Milestone 2 adds a beginner-friendly backend-supported feature: persistent
attendee registration. The existing attendee registration form now sends data
to an Express.js REST API instead of saving new registrations only in the
browser.

### Backend-supported functionality

- Express.js serves the frontend and provides the backend API on port `8000`.
- `POST /api/registrations` receives attendee name, email, event ID, and event
  context.
- The backend validates attendee input, event status, event schedule, and
  available capacity.
- Confirmed registrations are stored in
  `backend/data/registrations.json`, so they remain available after a server
  restart.
- `GET /api/registrations` retrieves stored registration records for the
  manager workspace.
- `PATCH /api/registrations/:id/cancel` cancels a registration and releases
  its place.
- `DELETE /api/registrations/:id` removes a canceled registration.
- `GET /api/health` provides a simple backend availability check.
- Backend errors return clear HTTP responses that the frontend displays to the
  user.
- A serialized write queue protects capacity checks from overlapping writes
  during simultaneous registration requests.

### Milestone 2 information flow

1. An attendee completes the existing registration form.
2. The frontend reviews the attendee details before submission.
3. The frontend sends the registration to `POST /api/registrations`.
4. The backend validates the request and checks event availability.
5. The backend stores the confirmed registration and returns its ID and
   timestamp.
6. The confirmation screen displays the returned registration details.
7. The manager registration view retrieves records from the backend API.

### Milestone 2 testing coverage

The backend test suite covers valid registration, email normalization, invalid
name and email input, full-event rejection, and retrieval of persisted records.
The frontend also handles unavailable backend services and API validation
errors with user-facing messages.

### Milestone 2 scope and future work

This first backend feature intentionally uses a JSON file rather than a
database so the data flow remains easy to understand and demonstrate. Future
backend work may replace the file with SQLite or another database, add
server-side manager authentication and authorization, move event records to
the backend, and add multi-user event synchronization.

## Milestone 1 fixes carried into Milestone 2

- **Session-expiration routing:** protected and invalid direct URLs now clear
  stale authentication state before redirecting to the login screen. This
  prevents stale session values from causing redirect or reload loops.
- **Direct-login rendering:** signing in while already visiting a protected
  hash route now correctly renders the manager dashboard.
- **Dashboard status visibility:** manager event cards show high-contrast
  `FULL` and `CLOSED` badges without requiring the manager to open event
  details.
- **Capacity-aware status:** `FULL` is shown when no active places remain,
  while `CLOSED` continues to represent the event lifecycle status.
- **Sample workflow date:** the published sample event uses a future date so
  the invite-only attendee route remains demonstrable.
- **Persistence documentation:** the project now distinguishes browser-local
  event data from backend-persisted registration data.

## Demo login

- Username: `agent`
- Password: `1234`

These credentials are defined in `frontend/src/shared/auth.js` and are for the
demo only. Because they are in the browser code, this login separates the
manager and attendee experiences but is not real security. Secure,
server-side authentication is planned for a future backend.

## Demo workflow

1. Open the live page and sign in with the demo login.
2. Select **New event**, fill in the details, set the status to **Published**,
   and save.
3. Open the event with **View details** and select **Copy link** under
   **Attendee link**.
4. Paste the link into a **new tab in the same browser**. Only that event's
   registration page appears.
5. Register an attendee, review the details, and confirm.
6. Return to the manager tab and open **Registrations** to see the new record
   and updated availability.

To reset to the sample events, clear this site's Local Storage in the browser's
developer tools (Application → Local Storage) and refresh the page.

## Known limitations

- Data is saved in **one browser on one device**. An invite link opened on a
  different device, or in a private or incognito window, will not find events
  created elsewhere. Sharing data across devices requires a backend.
- The app does not send email, process payments, or send attendee information
  to a server.

## Run locally

The app uses native JavaScript modules, so open it through a local HTTP server
rather than directly from the file system. No packages or database are needed
to run the frontend.

From the repository root:

```bash
npm install
npm start
```

Then open <http://localhost:8000/#events> for the manager workspace or
<http://localhost:8000/#register> for the attendee page.

Alternatively, use any static file server with `frontend/` as its document
root.

## Demo workflow

Keep the demonstration in one browser tab so the connected sample data remains
available:

1. Sign in and create a future event.
2. Publish the event, then select **Preview attendee page**.
3. Register an attendee and confirm the registration.
4. Select **Manager workspace** in the public header.
5. Open **Registrations** to show the new record and updated availability.

Refreshing the page resets the sample data. The app does not send email,
process payments, or persist attendee information to a server.

## Main routes

| Route | Who can open it | Purpose |
| --- | --- | --- |
| `#login` | Anyone | Manager sign-in |
| `#events` | Manager | Event list and event creation |
| `#detail` | Manager | Event details, status controls, and attendee link |
| `#editor` | Manager | Create or edit an event |
| `#registrations` | Manager | Review, cancel, and remove registrations |
| `#register/<event id>` | Anyone with the link | Invited event page |
| `#form/<event id>` | Anyone with the link | Attendee details and review |
| `#confirmation` | Attendee after registering | Registration confirmation and reference |

## Workflows and CRUD ownership

- Manager: Log in → Events → Create or edit → Publish → Copy attendee link
- Attendee: Attendee link → Register → Enter details → Review → Confirmation
- Registration management: Registrations → Cancel → Remove canceled record

| Operation | Events | Registrations |
| --- | --- | --- |
| Create | `events/service.js` | `registrations/service.js` |
| Read | `events/service.js` | `registrations/service.js` |
| Update | `events/service.js` | `registrations/service.js` |
| Delete | `events/service.js` | `registrations/service.js` |

Within each feature, `model.js` validates records, `service.js` applies
user-facing rules, and `store.js` stores records in `localStorage`. The usual
flow is: screen input → service rules → model validation → store update →
screen render.

## Tests

Run the Node test suite from the repository root:

```bash
node --test frontend/tests/*.test.js
```

The tests cover event and registration rules, CRUD behavior, availability,
removal protection, and route mapping. Node.js is required for this command;
it is not required to run the browser frontend.

## Project structure

```text
.github/
`-- workflows/
    `-- deploy-pages.yml
frontend/
|-- assets/
|   `-- logo.png
|-- index.html
|-- tests/
|   |-- events.test.js
|   |-- registrations.test.js
|   `-- routes.test.js
`-- src/
    |-- main.js
    |-- events/
    |-- registrations/
    |-- shared/
    `-- styles/
```

- `frontend/index.html` contains the application shell and page markup.
- `frontend/src/main.js` creates the stores, connects the features, and starts
  routing, login, and shared interface helpers.
- `frontend/src/events/` owns event validation, CRUD operations, sample data,
  the manager event screens, and the attendee invite page (`browse.js`).
- `frontend/src/registrations/` owns attendee validation, registration CRUD,
  and the registration screens.
- `frontend/src/shared/` contains login (`auth.js`), routing, the page shell,
  and DOM, formatting, and feedback helpers.
- `frontend/src/styles/` contains design tokens, layout, form, login, feature,
  and feedback styles.

## Design principles

- Adaptive monochrome visual system with clear states and comfortable targets.
- Semantic structure, visible keyboard focus, and reduced-motion support.
- Compact manager navigation that becomes horizontal on smaller screens.
- No database or API is required; data remains local to the current demo session.

## Repository

- [Live page](https://narupixel.github.io/MS1-event-reg/)
- [Issues](https://github.com/narupixel/MS1-event-reg/issues)
