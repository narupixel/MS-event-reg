# Event Registry

Event Registry is a browser application for creating events and managing
attendee registrations. It provides a manager workspace and a separate
invite-only attendee registration experience.

[Open the live page](https://narupixel.github.io/MS-event-reg/)

## Features

### Manager workspace

- Demo manager sign-in
- Create, view, edit, publish, close, and remove events
- Copy an invite-only attendee registration link
- View registration counts and remaining capacity
- See `FULL` and `CLOSED` status badges on event cards
- Review, cancel, and remove canceled registrations
- Receive confirmation dialogs, validation messages, and toast feedback

### Attendee experience

- Open an event using its invite link
- View the event schedule, venue, description, and availability
- Enter and review attendee details before submitting
- Receive a registration confirmation and reference
- Get clear feedback when an event is unavailable, closed, or full

## Demo login

- Username: `agent`
- Password: `1234`

These credentials are for the demonstration only. They are defined in
`frontend/src/shared/auth.js` and do not provide production-level security.

## Run locally

Node.js and npm are required.

From the project root:

```bash
npm install
npm start
```

Open the application at:

```text
http://localhost:8000/#events
```

The Express server serves the frontend and the API from the same origin.

## Typical workflow

1. Sign in with the demo credentials.
2. Select **New event** and enter the event details.
3. Set the event status to **Published** and save it.
4. Open the event details and copy the attendee link.
5. Open the link in a new browser tab.
6. Enter attendee details, review them, and confirm the registration.
7. Return to the manager workspace and open **Registrations**.

To reset browser-stored event data, clear this site's Local Storage and refresh
the page. Server-stored registrations are kept in the backend data file.

## Backend API

The application includes an Express.js backend for attendee registrations.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check that the server is available |
| `GET` | `/api/registrations` | Retrieve saved registrations |
| `POST` | `/api/registrations` | Validate and save a registration |
| `PATCH` | `/api/registrations/:id/cancel` | Cancel a registration |
| `DELETE` | `/api/registrations/:id` | Remove a canceled registration |

When an attendee submits the registration form, the frontend sends the event
ID, attendee name, and email to the backend. The backend validates the input,
checks the event status, schedule, and capacity, then saves the confirmed
registration.

Registrations are stored in:

```text
backend/data/registrations.json
```

They remain available after the server restarts. The backend also serializes
registration writes so simultaneous requests are checked safely against the
available capacity.

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `#login` | Anyone | Manager sign-in |
| `#events` | Manager | Event list and event creation |
| `#detail` | Manager | Event details and attendee link |
| `#editor` | Manager | Create or edit an event |
| `#registrations` | Manager | Review and manage registrations |
| `#register/<event id>` | Invite link | Event registration page |
| `#form/<event id>` | Invite link | Attendee details and review |
| `#confirmation` | After registration | Registration confirmation |

## Storage and validation

- Event definitions are stored in the browser's Local Storage.
- Registrations are stored by the Express backend in
  `backend/data/registrations.json`.
- The manager session uses browser Session Storage.
- Event and registration rules are validated before records are saved.
- The backend is the authoritative validation layer for attendee registration,
  including event availability and capacity.
- The application does not send email or process payments.

## Testing

Run the complete automated test suite from the project root:

```bash
npm test
```

The tests cover:

- Event validation and lifecycle rules
- Event and registration CRUD behavior
- Capacity and availability rules
- Registration removal protection
- Route mapping
- Backend registration validation
- Email normalization
- Full-event rejection
- Persistence and retrieval of saved registrations

## Project structure

```text
backend/
|-- data/
|   `-- registrations.json
|-- server.js
`-- tests/
    `-- registrations.test.js
frontend/
|-- assets/
|   `-- logo.png
|-- index.html
|-- src/
|   |-- events/
|   |-- registrations/
|   |-- shared/
|   `-- styles/
`-- tests/
    |-- events.test.js
    |-- registrations.test.js
    `-- routes.test.js
```

- `backend/server.js` serves the frontend and provides the registration API.
- `frontend/src/main.js` connects the application features and starts routing.
- `frontend/src/events/` manages event validation, lifecycle operations, and
  manager and attendee event views.
- `frontend/src/registrations/` manages attendee forms, API communication,
  registration validation, and registration views.
- `frontend/src/shared/` contains authentication, routing, DOM, formatting,
  layout, and feedback helpers.
- `frontend/src/styles/` contains the visual design and responsive styles.

## Design principles

- Clear separation between manager and attendee experiences
- Responsive layouts for mobile and desktop screens
- Semantic HTML and visible keyboard focus
- Clear validation, status, and error feedback
- Small, reusable feature modules
- Simple persistence suitable for local demonstration

## Links

- [Live page](https://narupixel.github.io/MS-event-reg/)
- [Repository issues](https://github.com/narupixel/MS-event-reg/issues)
