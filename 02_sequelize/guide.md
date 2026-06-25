# Guide: Image Upload with Multer + Cloudinary

## Overview

Upload hotel images using **Multer** (multipart form parsing + local temp storage) and **Cloudinary** (cloud image hosting CDN).

### Architecture Flow

```
Client sends multipart/form-data (file)
       │
       ▼
──────────────────────────────────────────────
           MULTER MIDDLEWARE (Layer 0)
  Receives file, saves to ./public/temp/
  Attaches file info to req.file
       │
       ▼
──────────────────────────────────────────────
              ROUTER (Layer 1)
  POST /api/v1/hotels/:id/image
       │
       ▼
──────────────────────────────────────────────
            CONTROLLER (Layer 2)
  Extracts req.params.id, req.file.path
  Calls service layer
       │
       ▼
──────────────────────────────────────────────
             SERVICE (Layer 3)
  Calls uploadToCloudinary() middleware
  Calls repository to save URL
       │
       ▼
──────────────────────────────────────────────
       CLOUDINARY MIDDLEWARE (Layer 3b)
  Uploads file to Cloudinary CDN
  Deletes temp file from disk
  Returns response with URL
       │
       ▼
──────────────────────────────────────────────
            REPOSITORY (Layer 4)
  Updates hotel.imageUrl in database
       │
       ▼
──────────────────────────────────────────────
              MODEL (Layer 5)
  Sequelize ORM → MySQL table
```

---

## Part 1: File-by-File Code

Every file needed for this feature, shown in full with explanation.

---

### File 1: `.env` — Environment Variables

```bash
# 02_sequelize/.env

PORT=
DB_HOST=
DB_PORT=
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
DB_DIALECT=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

| Variable | Purpose |
|----------|---------|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary account cloud name (from dashboard) |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

These are loaded by `dotenv` in `config/index.js` and passed to Cloudinary's SDK.

---

### File 2: `src/config/index.js` — Config Exports

```js
// 02_sequelize/src/config/index.js

import dotenv from "dotenv"

function loadEnv() {
  return dotenv.config()
}

loadEnv()

export const serverConfig = {
  port: process.env.PORT || 3000,
}

export const dbConfig = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
}

export const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}
```

**Key points:**
- `cloudinaryConfig` reads the three env vars and exports them as an object
- This is imported by `cloudinary.js` to configure the SDK

---

### File 3: `src/config/cloudinary.js` — Cloudinary SDK Init

```js
// 02_sequelize/src/config/cloudinary.js

import { v2 as cloudinary } from "cloudinary"
import { cloudinaryConfig } from "./index.js"

export function initCloudinary() {
  cloudinary.config({
    cloud_name: cloudinaryConfig.cloud_name,
    api_key: cloudinaryConfig.api_key,
    api_secret: cloudinaryConfig.api_secret,
  })
}

export { cloudinary }
```

**What happens here:**

| Line | What it does |
|------|-------------|
| `import { v2 as cloudinary }` | Imports the Cloudinary SDK v2, renames to `cloudinary` |
| `export function initCloudinary()` | Function that configures Cloudinary with your credentials |
| `cloudinary.config({...})` | The one-time SDK setup — must be called before any upload |
| `export { cloudinary }` | Re-exports the configured instance so other files can upload |

**Why `initCloudinary()` is separate:** Cloudinary config needs to happen **once** at server startup. We call it from `server.js`. Then every other file just imports the already-configured `cloudinary` instance.

---

### File 4: `src/server.js` — Entry Point

```js
// 02_sequelize/src/server.js

import { app } from "./app.js"
import { serverConfig } from "./config/index.js"
import { sequelize } from "./config/sequelize.js"
import { initCloudinary } from "./config/cloudinary.js"

initCloudinary()

app.listen(serverConfig.port, async () => {
  await sequelize.authenticate()
  console.log("db connected")
  console.log(`Server is running on port ${serverConfig.port}`)
})
```

**The startup sequence:**

1. `initCloudinary()` — Configures Cloudinary SDK with `.env` credentials
2. `app.listen(...)` — Starts Express server
3. `sequelize.authenticate()` — Checks DB connection
4. Server is ready to accept requests

`initCloudinary()` is called **before** the server starts listening, so by the time any upload request arrives, Cloudinary is ready.

---

### File 5: `src/middlewares/multer.middleware.js` — File Receiver

```js
// 02_sequelize/src/middlewares/multer.middleware.js

import multer from "multer"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  },
})

export const upload = multer({ storage })
```

**How Multer works:**

| Piece | What it does |
|-------|-------------|
| `multer.diskStorage({...})` | Tells Multer to save files to disk (not memory) |
| `destination` | Folder where uploaded files go: `./public/temp/` |
| `filename` | Keeps the original file name |
| `upload = multer({ storage })` | Creates the configured middleware instance |
| `upload.single("image")` | (Used in the router) — accepts one file from form field named `"image"` |

After Multer processes the request, `req.file` is populated with:

```js
{
  fieldname: "image",
  originalname: "photo.jpg",
  path: "public/temp/photo.jpg",     // ← this is what we pass to Cloudinary
  mimetype: "image/jpeg",
  size: 524288                       // bytes
}
```

**Directory setup:** Make sure `public/temp/` exists:

```bash
mkdir -p 02_sequelize/public/temp
```

---

### File 6: `src/middlewares/cloudinary.middleware.js` — Cloudinary Uploader

```js
// 02_sequelize/src/middlewares/cloudinary.middleware.js

import { cloudinary } from "../config/cloudinary.js"
import fs from "fs"

export async function uploadToCloudinary(localPath) {
  try {
    if (!localPath) return null

    const response = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    })

    console.log("Cloudinary upload success:", response.url)
    fs.unlinkSync(localPath)

    return response
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message)

    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath)
    }

    return null
  }
}
```

**Step-by-step execution:**

| Step | Code | What happens |
|------|------|-------------|
| 1 | `if (!localPath)` | Guard clause — if path is empty/null, return null immediately |
| 2 | `cloudinary.uploader.upload()` | Sends the local file to Cloudinary servers |
| 3 | `resource_type: "auto"` | Cloudinary auto-detects if it's an image, video, or raw file |
| 4 | `response.url` | Cloudinary returns the CDN URL of the uploaded file |
| 5 | `fs.unlinkSync(localPath)` | **Cleanup** — deletes the temp file from disk (both on success AND failure) |

**The `response` object from Cloudinary looks like:**

```js
{
  public_id: "abc123",
  url: "https://res.cloudinary.com/far-fetch/image/upload/v1234567890/abc123.jpg",
  secure_url: "https://res.cloudinary.com/far-fetch/image/upload/v1234567890/abc123.jpg",
  format: "jpg",
  bytes: 524288,
  // ...
}
```

We use `response.url` to store in the database.

**Why delete the temp file?** The file in `./public/temp/` is a temporary copy. Once uploaded to Cloudinary, keeping it on disk wastes space. We always clean up, even if the upload fails.

**What was the original bug?**
- Before the fix: `cloudinaryCloud.uploader.upload()` — `cloudinaryCloud` was a **function** (returns `undefined`), so calling `.uploader` on it crashed.
- After the fix: Imports `cloudinary` directly (the configured SDK instance), calls `cloudinary.uploader.upload()`.

---

### File 7: `src/app.js` — Express App Setup

```js
// 02_sequelize/src/app.js

import e from "express"
import path from "path"
import { fileURLToPath } from "url"
import v1Router from "./router/v1/index.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const app = e()

app.use(e.json({ limit: "16kb" }))
app.use("/public", e.static(path.join(__dirname, "../public")))

app.use("/api/v1", v1Router)
```

**What's new here:**

| Line | Purpose |
|------|---------|
| `import path from "path"` | Node.js path module for constructing directory paths |
| `import { fileURLToPath } from "url"` | Needed because ES modules don't have `__dirname` |
| `__dirname` | Manually construct `__dirname` (equivalent to CommonJS's `__dirname`) |
| `app.use("/public", e.static(...))` | Serves `./public/` at the `/public` URL path so uploaded temp files could be accessed (though we delete them after Cloudinary upload) |

The `.static()` middleware is included so that if needed, static files in `public/` are accessible at `http://localhost:3000/public/...`.

---

### File 8: `src/db/models/hotel.modal.js` — Hotel Model

```js
// 02_sequelize/src/db/models/hotel.modal.js

import { Model } from "sequelize"
import { sequelize } from "../../config/sequelize.js"
import { DataTypes } from "sequelize"

class Hotel extends Model {
  id
  name
  address
  city
  state
  zip
  country
  phone
  email
  imageUrl
  createdAt
  updatedAt
  deletedAt
}

Hotel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "hotels",
    timestamps: true,
    paranoid: true,
  }
)

export default Hotel
```

**The `imageUrl` addition:**

| Location | Line | What it does |
|----------|------|-------------|
| Class body | `imageUrl` | Declares the JS property on the Model class |
| Schema | `imageUrl: { type: DataTypes.STRING, allowNull: true }` | Adds a VARCHAR column that can be NULL (no image yet) |

After upload, `imageUrl` will hold something like `"https://res.cloudinary.com/..."`.

---

### File 9: Migration — Adding the Column to MySQL

```js
// 02_sequelize/src/db/migrations/20260625120000-add-imageurl-to-hotels-table.js

export default {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("hotels", "imageUrl", {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("hotels", "imageUrl")
  },
}
```

**Migration commands:**

```bash
# Run the migration (adds imageUrl column)
npm run migrate:run

# If you need to undo:
npm run migrate:undo
```

**What `addColumn` does:** Executes SQL equivalent to:

```sql
ALTER TABLE hotels ADD COLUMN imageUrl VARCHAR(255) NULL;
```

---

### File 10: `src/repositories/hotel.repositories.js` — Database Queries

```js
// 02_sequelize/src/repositories/hotel.repositories.js

import Hotel from "../db/models/hotel.modal.js"

export async function createHotel({ name, address, city, state, zip, country, phone, email }) {
  const hotel = await Hotel.create({
    name,
    address,
    city,
    state,
    zip,
    country,
    phone,
    email,
  })
  return hotel
}

export async function getHotelByid(id) {
  const hotel = await Hotel.findByPk(id)
  return hotel
}

export async function getAllHotels() {
  const hotels = await Hotel.findAll()
  return hotels
}

// ▼ NEW FUNCTION ▼

export async function updateHotelImage(id, imageUrl) {
  const hotel = await Hotel.findByPk(id)
  if (!hotel) return null

  hotel.imageUrl = imageUrl
  await hotel.save()

  return hotel
}

// ▼ EXISTING FUNCTIONS (soft/hard delete) ▼

export async function deleteHotel(id) {
  const hotel = await Hotel.findByPk(id)
  await hotel.destroy()
  return hotel
}

export async function hardDelete(id) {
  const hotel = await Hotel.findByPk(id, { paranoid: false })
  await hotel.destroy()
  return { message: "Hotel permanently deleted" }
}

export async function restoreHotel(id) {
  const hotel = await Hotel.findByPk(id, { paranoid: false })
  const restoredHotel = await hotel.restore()
  return restoredHotel
}
```

**How `updateHotelImage` works:**

| Step | Code | What happens |
|------|------|-------------|
| 1 | `Hotel.findByPk(id)` | Find the hotel by primary key |
| 2 | `if (!hotel) return null` | If no hotel found, return null (controller will send 404) |
| 3 | `hotel.imageUrl = imageUrl` | Set the JS property on the model instance |
| 4 | `await hotel.save()` | Persist the change to MySQL (UPDATE query) |
| 5 | `return hotel` | Return the updated hotel with the new URL |

The generated SQL is:

```sql
UPDATE hotels SET imageUrl = 'https://res.cloudinary.com/...', updatedAt = NOW() WHERE id = 1;
```

---

### File 11: `src/services/hotel.services.js` — Business Logic

```js
// 02_sequelize/src/services/hotel.services.js

import { createHotel, getHotelByid, updateHotelImage } from "../repositories/hotel.repositories.js"
import { uploadToCloudinary } from "../middlewares/cloudinary.middleware.js"

export const createHotelService = async ({ name, address, city, state, zip, country, phone, email }) => {
  const hotel = await createHotel({ name, address, city, state, zip, country, phone, email })
  return hotel
}

export const getHotelByidService = async (id) => {
  const hotel = await getHotelByid(id)
  return hotel
}

// ▼ NEW FUNCTION ▼

export const uploadHotelImageService = async (id, localPath) => {
  const cloudinaryResponse = await uploadToCloudinary(localPath)
  if (!cloudinaryResponse) return { error: "Image upload to Cloudinary failed" }

  const hotel = await updateHotelImage(id, cloudinaryResponse.url)
  if (!hotel) return { error: "Hotel not found" }

  return hotel
}
```

**What the service layer does:**

The service is the "orchestrator" — it coordinates multiple operations:

1. Upload the file to Cloudinary (via the middleware)
2. Save the returned URL to the database (via the repository)
3. Handle failures at each step with meaningful error messages

**Why a service layer?** If later you want to add logic like "resize image before uploading" or "only allow one image per hotel", you add it here without changing the controller or repository.

---

### File 12: `src/controllers/hotel.controllers.js` — Request Handlers

```js
// 02_sequelize/src/controllers/hotel.controllers.js

import { createHotelService, getHotelByidService, uploadHotelImageService } from "../services/hotel.services.js"

export const createHotelController = async (req, res) => {
  console.log(req.body)

  const { name, address, city, state, zip, country, phone, email } = req.body
  const hotel = await createHotelService({ name, address, city, state, zip, country, phone, email })
  return res.status(201).json(hotel)
}

export const getHotelByidController = async (req, res) => {
  const { id } = req.params
  const hotel = await getHotelByidService(id)
  return res.status(200).json(hotel)
}

// ▼ NEW FUNCTION ▼

export const uploadHotelImageController = async (req, res) => {
  const { id } = req.params

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" })
  }

  const result = await uploadHotelImageService(id, req.file.path)

  if (result.error === "Image upload to Cloudinary failed") {
    return res.status(500).json({ message: result.error })
  }

  if (result.error === "Hotel not found") {
    return res.status(404).json({ message: result.error })
  }

  return res.status(200).json({ message: "Image uploaded successfully", hotel: result })
}
```

**Controller responsibilities:**

| Step | Code | Purpose |
|------|------|---------|
| 1 | `const { id } = req.params` | Extract hotel ID from URL path |
| 2 | `if (!req.file)` | Validate that a file was actually sent (Multer populates this) |
| 3 | `uploadHotelImageService(id, req.file.path)` | Pass hotel ID + temp file path to service |
| 4 | Error checking | Translate service errors into HTTP responses |
| 5 | `res.status(200).json(...)` | Send success response with updated hotel |

**`req.file.path`** is the full path to the temp file, e.g., `"/home/user/project/public/temp/photo.jpg"`. This is what Cloudinary reads from disk.

---

### File 13: `src/router/v1/hotel.router.js` — Route Definition

```js
// 02_sequelize/src/router/v1/hotel.router.js

import { Router } from "express"
import {
  createHotelController,
  getHotelByidController,
  uploadHotelImageController,
} from "../../controllers/hotel.controllers.js"
import { upload } from "../../middlewares/multer.middleware.js"

const hotelROuter = Router()

hotelROuter.post("/", createHotelController)
hotelROuter.get("/:id", getHotelByidController)

// ▼ NEW ROUTE ▼

hotelROuter.post("/:id/image", upload.single("image"), uploadHotelImageController)

export default hotelROuter
```

**Route breakdown:**

```
POST /api/v1/hotels/:id/image
     │      │       │    │
     │      │       │    └── Endpoint: image upload
     │      │       └── Hotel ID from URL param
     │      └── Resource: hotels
     └── API version prefix (from v1/index.js)
```

**Middleware chain for this route:**

```
Request → upload.single("image") → uploadHotelImageController
                │                           │
        Multer parses form-data        Controller runs after
        Saves file to ./public/temp/   req.file is populated
        Sets req.file                  req.body is NOT parsed
```

`upload.single("image")` means: "Accept exactly one file from a form field named `image`". If the field name doesn't match, Multer ignores it and `req.file` stays `undefined` (the controller then returns a 400 error).

---

### File 14: `src/router/v1/index.js` — Router Aggregator

```js
// 02_sequelize/src/router/v1/index.js

import { Router } from "express"
import hotelRouter from "./hotel.router.js"

const v1Router = Router()

v1Router.use("/hotels", hotelRouter)

export default v1Router
```

This mounts all hotel routes under `/api/v1/hotels`. The route `POST /:id/image` in `hotel.router.js` becomes `POST /api/v1/hotels/:id/image`.

---

## Part 2: Setup Steps

### Step 1: Install Dependencies

```bash
cd 02_sequelize
npm install
```

This installs `cloudinary`, `multer`, `dotenv`, `express`, `sequelize`, `mysql2` from `package.json`.

### Step 2: Run the Migration

Adds the `imageUrl` column to the `hotels` table:

```bash
cd 02_sequelize
npm run migrate:run
```

Verify:

```bash
mysql -u root -p -e "DESCRIBE demo.hotels;"
```

You should see:

```
+-----------+--------------+------+-----+---------+----------------+
| Field     | Type         | Null | Key | Default | Extra          |
+-----------+--------------+------+-----+---------+----------------+
| id        | int          | NO   | PRI | NULL    | auto_increment |
| name      | varchar(255) | NO   |     | NULL    |                |
| ...       | ...          | ...  | ... | ...     | ...            |
| imageUrl  | varchar(255) | YES  |     | NULL    |                |  ← NEW
| createdAt | datetime     | NO   |     | NULL    |                |
| updatedAt | datetime     | NO   |     | NULL    |                |
| deletedAt | datetime     | YES  |     | NULL    |                |
+-----------+--------------+------+-----+---------+----------------+
```

### Step 3: Verify the Temp Directory

```bash
ls -la 02_sequelize/public/temp/
```

Should exist (even if empty). If not, create it:

```bash
mkdir -p 02_sequelize/public/temp
```

### Step 4: Start the Server

```bash
cd 02_sequelize
npm run dev
```

Expected output:

```
db connected
Server is running on port 3000
```

If you see errors:
- **"ECONNREFUSED"** → MySQL is not running. Start it: `sudo systemctl start mysql`
- **"Cloudinary config failed"** → Check `.env` has correct credentials
- **"port 3000 already in use"** → Change `PORT` in `.env` or kill the old process

---

## Part 3: Postman Testing

### Request 1: Create a Hotel

Creates a hotel record to attach an image to.

**Postman setup:**

| Tab | Setting | Value |
|-----|---------|-------|
| Method | | `POST` |
| URL | | `http://localhost:3000/api/v1/hotels` |
| Headers | | `Content-Type: application/json` |
| Body | | raw (JSON) |

**JSON body:**

```json
{
  "name": "Grand Palace Hotel",
  "address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zip": "400001",
  "country": "India",
  "phone": "9876543210",
  "email": "info@grandpalace.com"
}
```

**Expected response (201 Created):**

```json
{
  "id": 1,
  "name": "Grand Palace Hotel",
  "address": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "zip": "400001",
  "country": "India",
  "phone": "9876543210",
  "email": "info@grandpalace.com",
  "imageUrl": null,
  "updatedAt": "2026-06-25T11:00:00.000Z",
  "createdAt": "2026-06-25T11:00:00.000Z"
}
```

Note `imageUrl: null` — no image yet. Save the `id` (here it's `1`).

---

### Request 2: Upload an Image

**Postman setup:**

| Tab | Setting | Value |
|-----|---------|-------|
| Method | | `POST` |
| URL | | `http://localhost:3000/api/v1/hotels/1/image` |
| Headers | | **DO NOT set manually** — Postman auto-adds `Content-Type: multipart/form-data` |
| Body | | `form-data` |

**Form-data table (in Postman):**

| Key | Type | Value |
|-----|------|-------|
| `image` | **File** (click dropdown, select "File") | Click "Select Files" → pick any `.jpg`/`.png` |

**Important:** The key MUST be `image` because that's what `upload.single("image")` expects in the router. If you name it anything else, Multer won't process it.

**Common mistakes:**

| Mistake | What happens |
|---------|-------------|
| Key is not `image` | `req.file` is `undefined` → gets `400 No file uploaded` |
| Type is "Text" not "File" | Postman sends the filename as text, not the file bytes |
| Using `raw` body instead of `form-data` | Multer only parses `multipart/form-data` — will be `400` |
| Setting `Content-Type` manually | Postman might not set the boundary parameter → parsing fails |

**Expected response (200 OK):**

```json
{
  "message": "Image uploaded successfully",
  "hotel": {
    "id": 1,
    "name": "Grand Palace Hotel",
    "imageUrl": "https://res.cloudinary.com/far-fetch/image/upload/v1234567890/sample.jpg",
    "updatedAt": "2026-06-25T12:00:00.000Z",
    "createdAt": "2026-06-25T11:00:00.000Z",
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zip": "400001",
    "country": "India",
    "phone": "9876543210",
    "email": "info@grandpalace.com",
    "deletedAt": null
  }
}
```

**Server console output:**

```
Cloudinary upload success: https://res.cloudinary.com/far-fetch/image/upload/v1234567890/sample.jpg
```

---

### Request 3: Verify the Saved Image URL

**Postman setup:**

| Tab | Setting | Value |
|-----|---------|-------|
| Method | | `GET` |
| URL | | `http://localhost:3000/api/v1/hotels/1` |

**Expected response:**

```json
{
  "id": 1,
  "name": "Grand Palace Hotel",
  "imageUrl": "https://res.cloudinary.com/far-fetch/image/upload/v1234567890/sample.jpg",
  ...
}
```

Copy the `imageUrl` value and open it in a browser — you should see the uploaded image.

---

## Part 4: Error Scenarios to Test

### Test 1: No file in the request

**Setup:** Send `POST /api/v1/hotels/1/image` with an empty body (no form-data fields).

**Expected (400 Bad Request):**

```json
{
  "message": "No file uploaded"
}
```

**Why:** The controller checks `if (!req.file)` and returns 400 immediately.

---

### Test 2: Wrong field name

**Setup:** In Postman form-data, use key `"picture"` instead of `"image"` (Type: File).

**Expected (400 Bad Request):**

```json
{
  "message": "No file uploaded"
}
```

**Why:** `upload.single("image")` only processes a field named `image`. Any other name is ignored, so `req.file` stays `undefined`.

---

### Test 3: Non-existent hotel ID

**Setup:** Send `POST /api/v1/hotels/999/image` with a valid file.

**Expected (404 Not Found):**

```json
{
  "message": "Hotel not found"
}
```

**Why:** `updateHotelImage(999, url)` does `Hotel.findByPk(999)` which returns `null`.

---

### Test 4: Wrong HTTP method

**Setup:** Send `GET /api/v1/hotels/1/image` (GET instead of POST).

**Expected (404):**

```
<!DOCTYPE html>
<html>
  <head><title>Not Found</title></head>
  <body><h1>Not Found</h1></body>
</html>
```

**Why:** No GET route is defined for `/:id/image`. Express returns a default 404 HTML page.

---

## Part 5: Complete Request/Response Flow (Trace)

Here's the exact path of a successful upload:

```
1. POST /api/v1/hotels/1/image  (multipart/form-data, file attached)
       │
2. multer.middleware.js
   ├── Multer reads the form-data
   ├── Finds field "image" with a file
   ├── Saves to ./public/temp/photo.jpg
   └── Sets req.file = { path: "./public/temp/photo.jpg", ... }
       │
3. hotel.router.js
   └── Calls uploadHotelImageController(req, res)
       │
4. hotel.controllers.js
   ├── req.params.id → "1"
   ├── req.file.path → "./public/temp/photo.jpg"
   ├── Calls uploadHotelImageService("1", "./public/temp/photo.jpg")
   └── Controller awaits result
       │
5. hotel.services.js
   ├── Calls uploadToCloudinary("./public/temp/photo.jpg")
   │       │
   │   5a. cloudinary.middleware.js
   │   ├── Calls cloudinary.uploader.upload("./public/temp/photo.jpg")
   │   ├── Cloudinary CDN stores the image
   │   ├── Returns { url: "https://res.cloudinary.com/.../photo.jpg" }
   │   ├── console.log("Cloudinary upload success: ...")
   │   └── fs.unlinkSync("./public/temp/photo.jpg")  ← cleanup
   │
   ├── cloudinaryResponse = { url: "https://res.cloudinary.com/.../photo.jpg" }
   │
   ├── Calls updateHotelImage("1", "https://res.cloudinary.com/.../photo.jpg")
   │       │
   │   5b. hotel.repositories.js
   │   ├── Hotel.findByPk(1) → finds the hotel row
   │   ├── hotel.imageUrl = "https://res.cloudinary.com/.../photo.jpg"
   │   ├── await hotel.save()  → UPDATE hotels SET ... WHERE id = 1
   │   └── Returns the updated hotel object
   │
   └── Returns hotel object with imageUrl set
       │
6. hotel.controllers.js
   ├── result.error → undefined (no error)
   ├── res.status(200).json({ message: "Image uploaded successfully", hotel })
   └── Response sent to client
       │
7. Client receives:
   {
     "message": "Image uploaded successfully",
     "hotel": { "id": 1, "imageUrl": "https://res.cloudinary.com/...", ... }
   }
```

---

## Part 6: Files Summary

| # | File | Layer | New/Updated |
|---|------|-------|-------------|
| 1 | `.env` | Config | Existing (credentials already set) |
| 2 | `src/config/index.js` | Config | Existing (cloudinaryConfig already present) |
| 3 | `src/config/cloudinary.js` | Config | **Fixed** — now exports `initCloudinary()` + `cloudinary` |
| 4 | `src/server.js` | Entry | **Updated** — calls `initCloudinary()` |
| 5 | `src/app.js` | Express | **Updated** — added static file serving |
| 6 | `src/middlewares/multer.middleware.js` | Multer | Existing (unchanged) |
| 7 | `src/middlewares/cloudinary.middleware.js` | Cloudinary | **Fixed** — uses `cloudinary.uploader.upload()` |
| 8 | `src/db/migrations/...-add-imageurl-to-hotels-table.js` | DB | **New** — adds `imageUrl` column |
| 9 | `src/db/models/hotel.modal.js` | Model | **Updated** — added `imageUrl` field |
| 10 | `src/repositories/hotel.repositories.js` | Repository | **Updated** — added `updateHotelImage()` |
| 11 | `src/services/hotel.services.js` | Service | **Updated** — added `uploadHotelImageService()` |
| 12 | `src/controllers/hotel.controllers.js` | Controller | **Updated** — added `uploadHotelImageController()` |
| 13 | `src/router/v1/hotel.router.js` | Router | **Updated** — added `POST /:id/image` route |
| 14 | `src/router/v1/index.js` | Router | Existing (unchanged) |
