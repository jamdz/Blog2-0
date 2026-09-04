# Blog API 2.0

## 1. Project Description

Blog API 2.0 is a RESTful backend for a blogging platform built with Node.js, Express, and MongoDB. It supports:

- User registration, login, and profile management
- Blog post creation, editing, deletion, search, and category filtering — with image upload support
- Role-based access control, distinguishing regular users from admins via a single `role` field on the user model
- Admin capabilities for managing users and moderating posts, including viewing all users, viewing a specific user's posts, and cascading deletion of a user along with all of their posts

Users and admins share the same `UserModel` collection (differentiated by `role: "user"` / `role: "admin"`), so authentication and JWTs work the same way for both — only the permissions differ.

## 2. Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| Express 5 | Web framework / routing |
| MongoDB + Mongoose | Database and ODM |
| jsonwebtoken (JWT) | Authentication tokens |
| bcryptjs | Password hashing |
| multer | Multipart form handling / image upload |
| cookie-parser | Reading the JWT from HTTP-only cookies |
| dotenv | Environment variable loading |
| nodemon | Dev-time auto-restart |

## 3. Installation Instructions

**Prerequisites:** Node.js and a MongoDB database (local or Atlas).

```bash
# 1. Clone or extract the project, then move into it
cd Blog2.0

# 2. Install dependencies
npm install

# 3. Create a .env file in the project root (see Environment Variables below)

# 4. Run the server
npm start        # production
npm run dev       # development, with nodemon auto-restart
```

The server runs on **port 3000** by default: `http://localhost:3000`.

> Note: uploaded post images are saved to the local `uploads/` folder on disk. If you deploy this to a platform with an ephemeral filesystem (e.g. Render, Railway, Vercel), files in `uploads/` will be lost on redeploy — swap `multer`'s disk storage for a cloud storage provider (e.g. Cloudinary, S3, Supabase Storage) before deploying.

## 4. Environment Variables

Create a `.env` file in the project root with the following keys:

| Variable | Description |
|---|---|
| `databaseURL` | MongoDB connection string |
| `JWT_SECRET` | Secret key used to sign and verify JWTs |

```env
databaseURL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## 5. API Endpoints

All routes are prefixed with `/v1/api`.

### Users — `/v1/api/users`

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/register` | No | Register a new user |
| POST | `/login` | No | Log in, returns a JWT and sets an HTTP-only cookie |
| GET | `/profile` | Yes | Get the logged-in user's own profile |
| POST | `/logout` | Yes | Clear the auth cookie |
| PATCH | `/update-profile` | Yes | Update the logged-in user's own profile |
| DELETE | `/delete-profile` | Yes | Delete the logged-in user's own account |

### Posts — `/v1/api/posts`

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/create-post` | Yes | Create a post (multipart form-data; `image` is required) |
| GET | `/my-posts` | Yes | Get all posts created by the logged-in user |
| PATCH | `/update-post/:postId` | Yes | Update one of the logged-in user's own posts |
| DELETE | `/delete-post/:postId` | Yes | Delete one of the logged-in user's own posts |
| GET | `/search-posts?query=` | No | Search posts by title or content |
| GET | `/filter-posts?category=` | No | Filter posts by category |

**Creating/updating a post** requires `multipart/form-data`, not JSON, with fields:
- `title` (text)
- `content` (text)
- `category` (text)
- `image` (file)

### Admin auth — `/v1/api/admin/auth`

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/register` | No* | Register a new admin (creates a `UserModel` document with `role: "admin"`) |
| POST | `/login` | No | Admin login, returns a JWT and sets an HTTP-only cookie |
| GET | `/profile` | Yes (admin) | Get the logged-in admin's own profile |
| POST | `/logout` | Yes (admin) | Clear the auth cookie |

\* `*/admin/auth/register` currently has no authentication guard, meaning anyone can create an admin account. Before deploying, restrict this route to existing admins only (or remove it and promote admins via direct DB access / a seed script).

### Admin — user management — `/v1/api/admin`

All routes below require a valid admin token.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | Get all regular (`role: "user"`) users |
| GET | `/users/:id` | Get a single user by ID |
| GET | `/users/posts/:id` | Get all posts written by a specific user |
| DELETE | `/users/:id` | Delete a user and cascade-delete all of their posts |

## 6. Authentication Instructions

Authentication uses **JWTs stored in an HTTP-only cookie** named `token`, set automatically on login.

1. **Register** via `POST /v1/api/users/register` (or `/v1/api/admin/auth/register` for an admin account).
2. **Log in** via `POST /v1/api/users/login` or `POST /v1/api/admin/auth/login` with your credentials. The server:
   - Signs a JWT and returns it in the JSON response body, **and**
   - Sets it as an HTTP-only `token` cookie (`sameSite: strict`, expires in 1 hour for users / 2 hours for admins)
3. **Authenticated requests** are verified by reading the `token` cookie — no `Authorization` header is used. If you're testing with Postman, enable cookie jar / "send cookies automatically" so the cookie persists across requests after login.
4. **Logging out** (`POST /users/logout` or `POST /admin/auth/logout`) clears the cookie.

**Important — token payload differs by login route.** Regular user login (`/users/login`) signs `{ userId, email }` into the JWT. Admin login (`/admin/auth/login`) signs `{ id, role }`. Downstream code reads `req.user.userId` in user/post controllers and `req.user.role` / `req.user.id` in admin controllers — so an admin who logs in via the *regular* user route will not have `role` on their token, and admin-only middleware will reject them. **Always log in through `/v1/api/admin/auth/login` to access admin-protected routes.** (Unifying the JWT payload shape across both login flows — e.g. always signing `{ id, userId, role }` — would remove this foot-gun and is worth doing before this goes further.)
