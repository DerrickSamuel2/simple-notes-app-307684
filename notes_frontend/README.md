# Notes Frontend (React)

A simple notes UI that can list, create, edit, and delete notes via a backend REST API.

## Features

- Notes list (with optional search filter by title)
- Create new note
- Edit existing note
- Delete note (with confirmation)
- Loading/error states + retry
- Empty state UI
- Basic validation (title required)
- Uses a small `fetch`-based API client module

## API requirements

This frontend expects the backend to provide these routes:

- `GET /notes` → returns an array of notes (or `{ items: [] }`)
- `POST /notes` → creates a note from `{ title, content }`
- `PUT /notes/:id` → updates a note with `{ title, content }`
- `DELETE /notes/:id` → deletes a note

A note is expected to look like:

```json
{ "id": "string-or-number", "title": "string", "content": "string" }
```

## Environment variables

Set one of the following (preferred first):

- `REACT_APP_API_BASE` (preferred)
- `REACT_APP_BACKEND_URL`

Example:

```bash
REACT_APP_API_BASE=http://localhost:8000
```

Important: Create React App reads env vars at build/start time, so **restart `npm start`** after changing env vars.

## Run locally

From `notes_frontend/`:

```bash
npm install
npm start
```

Open http://localhost:3000

## Troubleshooting

- If you see “Backend URL missing”, set `REACT_APP_API_BASE` or `REACT_APP_BACKEND_URL` and restart the dev server.
- If loading fails, use the Retry button (network errors and timeouts are handled with friendly messages).
"
