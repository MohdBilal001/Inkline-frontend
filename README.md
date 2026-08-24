# Inkline — frontend

A React frontend scaffold for the Medium-style blogging platform, built to sit in front of
the Spring Boot API described in the project plan.

## Stack

- React 18 + Vite
- React Router
- Tailwind CSS (custom design tokens, no default UI kit)

## Design direction

Named **Inkline**. The brief is a reading/writing platform, so the design leans into
typography rather than app chrome:

- **Palette** — warm paper background (`#F6F4EF`), near-black ink text, a deep ink-green
  accent (`#2F5233`) standing in for a fountain pen rather than the usual orange/terracotta.
- **Type** — Fraunces (serif display) for headlines, Source Serif 4 for article body copy,
  Inter for UI chrome (nav, buttons, meta text).
- **Signature element** — a thin vertical "ink line" on the left edge of the article page
  that fills as you scroll (`ReadingProgress.jsx`), plus a drop-cap on the first paragraph.
  Both nod to the printed page instead of a generic progress bar.

## Pages

- `/` — Feed, filterable by tag
- `/article/:slug` — Article reader with reading progress + claps
- `/write` — Editor to draft and publish
- `/profile/:username` — Author profile
- `/login`, `/signup` — Auth forms

## Running it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

> Note: dependencies could not be installed in the sandbox this was built in (no network
> access there), so this hasn't been build-verified end to end. `npm install && npm run dev`
> should work from a clean checkout — if you hit an error, paste it back and I'll fix it.

## Connecting to the Spring Boot backend

This now talks to the real `inkline-backend` API — mock data has been removed.
`src/api/client.js` matches the backend's actual contract:

- `POST /api/auth/login`, `POST /api/auth/signup` → `{ token, user }`, JWT stored in `localStorage`
- `GET /api/articles?page=&size=` → a Spring Data `Page`, unwrapped in the client
- `GET /api/articles/{slug}` → single article; `content` is one text blob on the backend,
  split into paragraphs client-side for the reader page
- `POST /api/articles` → requires `Authorization: Bearer <token>`, added automatically
- `GET /api/users/{id}`, `GET /api/users/username/{username}` → author profile

Known gaps, since the backend doesn't have these yet:
- **Tags** — the `Article` entity has no tags column, so the tag filter UI was removed.
  Add a `tags`/`article_tags` table plus a `?tag=` query param to bring it back.
- **Likes/comments** — `likes`/`comments` are plain counters with no endpoints to change
  them, so the article page shows the count read-only.
- **Articles-by-author** — there's no `GET /api/users/{id}/articles` yet, so the profile
  page fetches one page of the feed and filters client-side. Fine for a demo, not for scale.

## Running both together

1. Start MySQL and make sure the `inkline` database + `inkline_app` user from
   `application.properties` exist.
2. From the backend project: `mvn spring-boot:run` (starts on `:8080`, `ddl-auto=update`
   will create tables on first run).
3. From this project: `npm install && npm run dev` (starts on `:5173`, already whitelisted
   in the backend's CORS config).
4. Sign up a user at `/signup`, then publish something at `/write`.

## Next steps

- Add a tags table + query param, then reintroduce the tag filter UI
- Add like/comment endpoints and wire the article page's clap button back up
- Add a dedicated "articles by author" endpoint
- Replace the plain `<textarea>` editor with a markdown/rich-text editor
