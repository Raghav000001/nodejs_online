# Guide: Soft Delete, Hard Delete & Recover APIs

## Overview

Three endpoints to add to the **Hotel** resource:

| Method | Endpoint | Action |
|--------|----------|--------|
| `DELETE` | `/api/v1/hotels/:id` | **Soft delete** — marks hotel as deleted (keeps in DB) |
| `DELETE` | `/api/v1/hotels/:id/hard` | **Hard delete** — permanently removes from DB |
| `PATCH` | `/api/v1/hotels/:id/recover` | **Recover** — restores a soft-deleted hotel |

All three follow the existing layered architecture: **Router → Controller → Service → Repository → Model**

---

## Why `deletedAt` instead of `isDeleted`?

A common question — why use a timestamp column instead of a simple boolean `isDeleted` flag?

| Approach | Pros | Cons |
|----------|------|------|
| `deletedAt` (timestamp) | Knows **when** deletion happened. Sequelize `paranoid: true` supports it natively (`restore()`, auto-filtering). | Slightly more storage (DATETIME vs TINYINT) |
| `isDeleted` (boolean) | Smaller column | Loses the **when**. No native ORM support — you must write `WHERE isDeleted = 0` on every query manually. Can't tell a fresh delete from an old one. |

**We use `deletedAt` because:**
- Sequelize has first-class `paranoid` mode built around it — `destroy()` sets the timestamp, `findAll` auto-filters, `restore()` clears it. Zero manual query filtering.
- A timestamp is strictly more informative than a boolean. If you only need "is it deleted?" you can always check `deletedAt IS NOT NULL`.
- It's the standard convention in Sequelize projects.

## Step 1: Migration — Add `deletedAt` Column

Soft delete needs a `deletedAt` column (nullable DATETIME).

Create a migration:

```bash
npm run migrate:create -- add-deletedat-to-hotels
```

In the migration file (`up`):

```js
queryInterface.addColumn("hotels", "deletedAt", {
  type: Sequelize.DATE,
  allowNull: true,
  defaultValue: null
})
```

In `down`:

```js
queryInterface.removeColumn("hotels", "deletedAt")
```

Run it:

```bash
npm run migrate:run
```

---

## Step 2: Model — Add `deletedAt` Field & Paranoid Mode

In `hotel.modal.js`:

1. Add `deletedAt;` to the class body (field declaration)
2. Add to the `Hotel.init()` schema:

```js
deletedAt: {
  type: DataTypes.DATE,
  allowNull: true
}
```

3. In the third `options` argument of `Hotel.init()`, **replace** `timestamps: true` with **both**:

```js
timestamps: true,
paranoid: true
```

`paranoid: true` tells Sequelize:
- `destroy()` → sets `deletedAt` instead of deleting the row
- `findAll` / `findByPk` → automatically filters out soft-deleted rows (adds `WHERE deletedAt IS NULL`)
- `restore()` → sets `deletedAt` back to `null`

---

## Step 3: Repository — Add Queries

In `hotel.repositories.js`, add three functions:

### `deleteHotel(id)` — Soft delete

Uses the model's `destroy()` method. With `paranoid: true`, this sets `deletedAt` instead of deleting.

```js
export async function deleteHotel(id) {
  const hotel = await Hotel.findByPk(id)
  if (!hotel) return null
  await hotel.destroy()
  return hotel
}
```

### `hardDeleteHotel(id)` — Hard delete

Uses `destroy({ force: true })` to permanently remove.

```js
export async function hardDeleteHotel(id) {
  const hotel = await Hotel.findByPk(id, { paranoid: false })
  if (!hotel) return null
  await hotel.destroy({ force: true })
  return { message: "Hotel permanently deleted" }
}
```

**Note:** `{ paranoid: false }` in `findByPk` lets you find soft-deleted records too. Without it, `findByPk` won't find a soft-deleted hotel.

### `recoverHotel(id)` — Restore soft-deleted

Uses the model's `restore()` method.

```js
export async function recoverHotel(id) {
  const hotel = await Hotel.findByPk(id, { paranoid: false })
  if (!hotel) return null
  if (!hotel.deletedAt) return { message: "Hotel is not deleted" }
  await hotel.restore()
  return hotel
}
```

---

## Step 4: Service — Add Business Logic

In `hotel.services.js`, add three thin wrappers (same pattern as existing):

```js
export const deleteHotelService = async (id) => {
  return await deleteHotel(id)
}

export const hardDeleteHotelService = async (id) => {
  return await hardDeleteHotel(id)
}

export const recoverHotelService = async (id) => {
  return await recoverHotel(id)
}
```

> **Why service wrappers?** Keeps the architecture consistent. The service layer is where you'd add business logic later (e.g., "don't allow deleting a hotel with active bookings"). For now it's a pass-through.

---

## Step 5: Controller — Add Request Handlers

In `hotel.controllers.js`, add three controllers (same pattern as existing):

### Soft Delete Controller

```js
export const deleteHotelController = async (req, res) => {
  const { id } = req.params
  const hotel = await deleteHotelService(id)
  if (!hotel) return res.status(404).json({ message: "Hotel not found" })
  return res.status(200).json({ message: "Hotel soft deleted", hotel })
}
```

### Hard Delete Controller

```js
export const hardDeleteHotelController = async (req, res) => {
  const { id } = req.params
  const result = await hardDeleteHotelService(id)
  if (!result) return res.status(404).json({ message: "Hotel not found" })
  return res.status(200).json(result)
}
```

### Recover Controller

```js
export const recoverHotelController = async (req, res) => {
  const { id } = req.params
  const hotel = await recoverHotelService(id)
  if (!hotel) return res.status(404).json({ message: "Hotel not found" })
  if (hotel.message === "Hotel is not deleted") {
    return res.status(400).json(hotel)
  }
  return res.status(200).json({ message: "Hotel recovered", hotel })
}
```

---

## Step 6: Router — Add Routes

In `hotel.router.js`, add three new routes (same pattern as existing):

```js
import {
  createHotelController,
  getHotelByidController,
  deleteHotelController,
  hardDeleteHotelController,
  recoverHotelController
} from "../../controllers/hotel.controllers.js"
```

Then add below existing routes:

```js
hotelROuter.delete("/:id", deleteHotelController)
hotelROuter.delete("/:id/hard", hardDeleteHotelController)
hotelROuter.patch("/:id/recover", recoverHotelController)
```

---

## Step 7: Test the APIs

Start the server:

```bash
npm run dev
```

### Soft Delete

```bash
curl -X DELETE http://localhost:3000/api/v1/hotels/1
```

### Verify It's Soft-Deleted (normal GET should return 404-ish / null)

```bash
curl http://localhost:3000/api/v1/hotels/1
```

### Hard Delete

```bash
curl -X DELETE http://localhost:3000/api/v1/hotels/1/hard
```

### Recover

```bash
curl -X PATCH http://localhost:3000/api/v1/hotels/1/recover
```

---

## How Paranoid Mode Affects Queries

| Query | Paranoid Behavior |
|-------|-------------------|
| `findByPk(id)` | Ignores soft-deleted rows (returns null) |
| `findAll()` | Ignores soft-deleted rows |
| `findByPk(id, { paranoid: false })` | Includes soft-deleted rows |
| `destroy()` | Sets `deletedAt` instead of DELETE |
| `destroy({ force: true })` | Performs actual DELETE |
| `restore()` | Sets `deletedAt = null` |

---

## Summary: Files to Edit

| File | Action |
|------|--------|
| `src/db/migrations/...-add-deletedat-to-hotels.js` | **Create** new migration |
| `src/db/models/hotel.modal.js` | **Edit** — add `deletedAt` field + `paranoid: true` |
| `src/repositories/hotel.repositories.js` | **Edit** — add 3 repository functions |
| `src/services/hotel.services.js` | **Edit** — add 3 service wrappers |
| `src/controllers/hotel.controllers.js` | **Edit** — add 3 controller functions |
| `src/router/v1/hotel.router.js` | **Edit** — add 3 routes |
