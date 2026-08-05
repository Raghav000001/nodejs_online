# Prisma Client — Working Setup Guide

Goal: make the Prisma client importable and query the `Booking` table from plain-JS code.

**Already done:** migrations work, `Booking` table exists in MySQL (`booking_prisma` DB).
**Blocking issue:** Prisma 7's default `prisma-client` generator emits TypeScript only, and this project is plain JavaScript. Fix: use the still-supported legacy `prisma-client-js` generator, which emits runnable `.js`.

Every step below was verified working with your installed packages (Prisma 7.8.0).

---

## Step 1 — Change the generator in `src/prisma/schema.prisma`

Replace the generator block:

```prisma
generator client {
  provider = "prisma-client"          // OLD — emits TypeScript
  output   = "../generated/prisma"
}
```

with:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

No `output` line. The legacy generator writes into `node_modules` itself, and `@prisma/client` picks it up automatically. Nothing else in the schema changes.

## Step 2 — Generate the client

```bash
npx prisma generate --config=src/prisma.config.js
```

Takes ~40ms. Re-run it whenever you change the schema (new models / fields).

## Step 3 — Load `.env` in the client config

Add one line at the top of `src/config/prisma-client.config.js`:

```js
import "dotenv/config";
```

Without it, `process.env.DATABASE_URL` is `undefined` at runtime and the adapter fails. The rest of that file stays exactly as you wrote it (`PrismaMariaDb` + `new PrismaClient({ adapter })` is correct).

## Step 4 — Fix the wiring (these crash once the client works)

- `src/index.js` — imports the config as `prismaClientConfig` but uses `prismaClient` in the handler. Use one consistent name.
- `src/repositories/booking.repositories.js` — the config file is a **default** export, so import it as `import prismaClient from "../config/prisma-client.config.js"` (no braces).
- Same file — pass data correctly: `prismaClient.booking.create({ data: bookingData })`, not `{ bookingData }`.
- `src/index.js` — add `app.use(express.json())` before the routes, or `req.body` is `undefined`.

## Step 5 — Verify with a real query

Run the dev server and hit the endpoint, or run a quick standalone check:

```js
// temporary test file, delete after
import "dotenv/config";
import prisma from "./src/config/prisma-client.config.js";

const bookings = await prisma.booking.findMany();
console.log(bookings);
```

Expected: `[]` (empty array) if the table is empty — that means the client works.

---

## Why this works (short version)

- `@prisma/client` is just a shell that re-exports from a generated folder. That folder only exists after `prisma generate`.
- Prisma 7's new `prisma-client` generator emits `.ts` files with TS-only syntax (`export type`) — plain Node can't run them. `generatedFileExtension = "js"` does not fix it (by design).
- `prisma-client-js` (legacy, still supported in 7.8.0) generates runnable `.js` + `.d.ts` into `node_modules` and makes `import { PrismaClient } from "@prisma/client"` work — which is what your existing config already does.

**Alternative:** keep the new generator and run your app with `tsx` (or compile with `tsc`). More moving parts — only worth it if you plan to move the project to TypeScript.
