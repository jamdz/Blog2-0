# Blog API 2.0

A RESTful blogging API built with Node.js, Express, and MongoDB. It supports regular user accounts (registration, authentication, and CRUD on blog posts with image uploads) as well as a separate admin layer for managing users and moderating content.

## 1. Project Description

Blog API 2.0 is a backend service for a blogging platform. Registered users can create an account, log in, and manage their own blog posts (create, update, delete), including uploading a cover image per post. Anyone can browse, search, and filter all published posts through public endpoints. A separate admin role can log in through a dedicated admin auth flow and manage the platform — listing users, inspecting a user's posts, and deleting a user along with all of their posts in a single atomic operation.

Key features:
- User registration and login with hashed passwords and JWT-based authentication delivered via HTTP-only cookies
- Full CRUD for blog posts, scoped so users can only modify their own posts
- Image upload support for post covers via Multer
- Public post discovery: list all posts, full-text-style search, and category filtering
- Role-based admin access (`role: "admin"`) layered on top of the same authentication middleware
- Admin tools to view all users, view a single user, view a user's posts, and cascade-delete a user with all their posts (using a MongoDB transaction)

## 2. Technologies Used

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web framework / routing |
| **MongoDB** | Database |
| **Mongoose** | MongoDB ODM / schema modeling |
| **jsonwebtoken (JWT)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **cookie-parser** | Reading the JWT from HTTP-only cookies |
| **multer** | Multipart form-data handling / image uploads |
| **dotenv** | Environment variable management |
| **nodemon** (dev dependency) | Auto-restarting server during development |

The project uses native ES Modules (`"type": "module"` in `package.json`), so all files use `import`/`export` syntax.

## 3. Installation Instructions

**Prerequisites:** Node.js (v18+ recommended) and a MongoDB instance (local or a hosted service such as MongoDB Atlas).

1. **Clone the repository**
   ```bash
   git clone https://github.com/jamdz/Blog2-0.git
   cd Blog2-0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create your environment file**

   Create a `.env` file in the project root (see [Environment Variables](#4-environment-variables) below).

4. **Run the server**

   Development mode (auto-restarts on file changes):
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

5. **Confirm it's running**

   The server listens on port `3000`. Visit `http://localhost:3000/` — you should see a welcome JSON message confirming the API is live.

   > Note: the `uploads/` folder (used to store uploaded post images) must exist at the project root; it's already included in this repo.

## 4. Environment Variables

Create a `.env` file in the project root with the following keys:

| Variable | Description |
|---|---|
| `databaseURL` | MongoDB connection string (e.g. a `mongodb+srv://...` Atlas URI or a local `mongodb://localhost:27017/your-db-name`) |
| `JWT_SECRET` | Secret key used to sign and verify JWTs. Use a long, random string in production |

Example `.env`:
```env
databaseURL=mongodb+srv://<username>:<password>@cluster.mongodb.net/blog2
JWT_SECRET=your_long_random_secret_here
```

⚠️ Never commit your real `.env` file. Make sure it's listed in `.gitignore` (note: the repo currently has a `.gitIgnore` file — double-check the filename casing matches what Git expects on your OS, since Git treats `.gitignore` case-sensitively on Linux/macOS).

## 5. API Endpoints

All routes are prefixed with `/v1/api`. 🔒 indicates the route requires authentication (a valid `token` cookie); 🔒👑 indicates it also requires the `admin` role.

### User Routes — `/v1/api/users`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Log in and receive a JWT (set as an HTTP-only cookie) | Public |
| GET | `/profile` | Get the logged-in user's profile | 🔒 |
| POST | `/logout` | Log out (clears the auth cookie) | 🔒 |
| PATCH | `/update-profile` | Update the logged-in user's profile | 🔒 |
| DELETE | `/delete-profile` | Delete the logged-in user's account | 🔒 |

### Post Routes — `/v1/api/posts`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/create-post` | Create a new post (multipart form with an `image` file field, plus `title`, `content`, `category`) | 🔒 |
| GET | `/my-posts` | Get all posts belonging to the logged-in user | 🔒 |
| PATCH | `/update-post/:postId` | Update one of the logged-in user's own posts (optionally replace the image) | 🔒 |
| DELETE | `/delete-post/:postId` | Delete one of the logged-in user's own posts | 🔒 |
| GET | `/search-posts?query=` | Search all posts by title or content (case-insensitive) | Public |
| GET | `/filter-posts?category=` | Filter all posts by category | Public |
| GET | `/` | Get every blog post from every user | Public |

### Admin Auth Routes — `/v1/api/admin/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Register a new admin account | Public* |
| POST | `/login` | Log in as an admin (username + password) and receive a JWT cookie | Public |
| GET | `/profile` | Get the logged-in admin's profile | 🔒👑 |
| POST | `/logout` | Log out the admin (clears the auth cookie) | 🔒👑 |

\* The admin registration endpoint is currently open/unprotected in the code. Consider restricting it (e.g. to a super-admin only, or disabling it after initial setup) before deploying to production.

### Admin User-Management Routes — `/v1/api/admin/manage`

All routes in this group require a logged-in admin (🔒👑).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List all users with the `user` role |
| GET | `/users/:id` | Get a single user by ID |
| GET | `/users/posts/:id` | Get all posts written by a specific user |
| DELETE | `/users/:id` | Delete a user and cascade-delete all of their posts (atomic transaction) |

## 6. Authentication Instructions

Authentication is JWT-based, delivered via **HTTP-only cookies** (not `Authorization` headers), for both regular users and admins.

**How it works:**

1. **Register or log in** via `POST /v1/api/users/register` (or `/login`) for regular users, or `POST /v1/api/admin/auth/login` for admins.
2. On successful login, the server:
   - Signs a JWT containing identifying info (`userId`/`email` for users, `id`/`role` for admins)
   - Sets it as an `httpOnly`, `sameSite: strict` cookie named `token`
   - Also returns the raw token in the JSON response body
3. **For subsequent requests to protected routes**, the browser/client automatically sends the `token` cookie. The `authMiddleware` reads `req.cookies.token`, verifies it against `JWT_SECRET`, and attaches the decoded payload to `req.user`.
4. **Admin-only routes** additionally pass through `requireAdmin`, which checks that `req.user.role === "admin"` (this middleware must run *after* `authMiddleware`).
5. **Token expiry:** user tokens expire after 1 hour; admin tokens expire after 2 hours. The client must log in again once the token expires.
6. **Logging out** clears the `token` cookie via the `/logout` endpoints.

**Testing with a tool like Postman/Insomnia:**
- Make sure cookie handling is enabled (Postman does this automatically per environment) so the `token` cookie set on login is sent on later requests.
- If testing without cookie support, you can alternatively grab the `token` from the login response body and manually attach it as a cookie header: `Cookie: token=<your_token>`.

**Roles:**
- New users registering through `/v1/api/users/register` default to `role: "user"`.
- Admins are created via `/v1/api/admin/auth/register` and are stored with `role: "admin"` in the same `UserModel` collection.

---

*Generated from a review of the project's source code (routers, controllers, models, and middleware). Update this file as the API evolves.*
