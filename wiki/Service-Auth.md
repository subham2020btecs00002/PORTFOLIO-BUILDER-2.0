# 🔐 Microservice 2: Auth Service (Port 5001)

The **Auth Service** is a dedicated NestJS microservice responsible for user account lifecycle management, authentication, credential cryptography, secure JWT generation, custom username assignment, and password recovery workflows.

---

## 🎯 Core Responsibilities

```
                                ┌─────────────────────────────┐
                                │  API Gateway (:3001) Ingress│
                                └──────────────┬──────────────┘
                                               │ (with x-internal-secret)
                                               ▼
                                ┌─────────────────────────────┐
                                │      InternalAuthGuard      │ ──► Rejects direct unauthenticated calls
                                └──────────────┬──────────────┘
                                               │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
       ┌────────────────────────┐┌────────────────────────┐┌────────────────────────┐
       │     Registration       ││     Login & Tokens     ││   Recovery & Slugs     │
       │• Bcrypt salted hashing ││• Verify password hash  ││• Forgot password token │
       │• Direct activation     ││• Issue access_token    ││• Reset password hash   │
       │• User profile document ││• Issue refresh_token   ││• PATCH /username slug  │
       └───────────┬────────────┘└───────────┬────────────┘└───────────┬────────────┘
                   │                         │                         │
                   └─────────────────────────┼─────────────────────────┘
                                             ▼
                               ┌─────────────────────────────┐
                               │     MongoDB Atlas (User)    │
                               └─────────────────────────────┘
```

1. **User Identity & Cryptography:** Securely creates user accounts with salted password hashing using `bcrypt` (10 rounds).
2. **Custom Public Username Slugs:** Validates and stores unique alphanumeric usernames (`username`), powering custom public portfolio links (`/p/:username`).
3. **Session Management (Dual-Token Pattern):**
   - **Access Token:** Short-lived JWT (15 minutes) signed with `JWT_SECRET` stored in HttpOnly cookie `access_token`.
   - **Refresh Token:** Long-lived JWT (7 days) signed with `JWT_REFRESH_SECRET` stored in HttpOnly cookie `refresh_token`, with cryptographic hash stored in the user document (`refreshTokenHash`).
4. **Token Rotation & Logout:** Endpoint `/api/auth/refresh` rotates tokens without requiring re-login. Endpoint `/api/auth/logout` clears active session cookies and nullifies the database refresh token hash.
5. **Password Recovery:** Generates cryptographically secure hex tokens (`resetPasswordToken`) with 1-hour expiration (`resetPasswordExpires`), sending password reset emails via Gmail SMTP using Nodemailer.
6. **Inter-Service Administration:** Exposes internal administration endpoints (`/api/auth/internal/*`) protected by `x-internal-secret` allowing the Portfolio Backend admin controller to update roles or delete user accounts atomically.

---

## 📊 Database Schema: `User` Model

Defined in `src/auth/schemas/user.schema.ts` using Mongoose:

| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `name` | `String` | `required: true` | User's display name |
| `email` | `String` | `required: true`, `unique: true`, `lowercase: true`, `trim: true` | User email address used for login |
| `password` | `String` | `required: true` | Bcrypt hashed password string |
| `username` | `String` | `unique: true`, `sparse: true` | Custom public URL slug (e.g., `johndoe` -> `/p/johndoe`) |
| `role` | `String` | `default: 'user'` | Role claim embedded in JWT for role-based access control (`user` or `admin`) |
| `refreshTokenHash` | `String` | `default: null` | Salted hash of current active refresh token |
| `resetPasswordToken`| `String`| `default: null` | One-time hex token used for password reset requests |
| `resetPasswordExpires`| `Date` | `default: null` | Expiration timestamp for reset token (1 hour) |
| `createdAt` | `Date` | Auto-managed | Account creation timestamp |
| `updatedAt` | `Date` | Auto-managed | Last update timestamp |

---

## 📡 API Endpoints Specification

All endpoints are prefixed with `/api/auth` and routed through the API Gateway:

### 1. Register User
- **Method / Route:** `POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "name": "Jane Developer",
    "email": "developer@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "6704b2a8f102c91a823b49e1",
      "email": "developer@example.com"
    }
  }
  ```

### 2. Login
- **Method / Route:** `POST /api/auth/login`
- **Request Body:** `{ "email": "developer@example.com", "password": "SecurePassword123!" }`
- **Response (`200 OK`):**
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "6704b2a8f102c91a823b49e1",
      "name": "Jane Developer",
      "email": "developer@example.com",
      "role": "user",
      "username": "janedev"
    }
  }
  ```
  *Sets HttpOnly cookies `access_token` and `refresh_token`.*

### 3. Refresh Tokens
- **Method / Route:** `POST /api/auth/refresh`
- **Cookies:** Reads `refresh_token`
- **Response (`200 OK`):** Issues fresh `access_token` cookie.

### 4. Logout
- **Method / Route:** `POST /api/auth/logout`
- **Response (`200 OK`):** Clears authentication cookies and returns `{ "message": "Logged out successfully" }`.

### 5. Get Current User Profile
- **Method / Route:** `GET /api/auth/user`
- **Headers:** Injected `x-user-id` from API Gateway
- **Response (`200 OK`):**
  ```json
  {
    "id": "6704b2a8f102c91a823b49e1",
    "name": "Jane Developer",
    "email": "developer@example.com",
    "role": "user",
    "username": "janedev"
  }
  ```

### 6. Update Custom Username
- **Method / Route:** `PATCH /api/auth/username`
- **Request Body:** `{ "username": "jane-codes" }`
- **Response (`200 OK`):** Returns updated user profile.

### 7. Forgot Password
- **Method / Route:** `POST /api/auth/forgot-password`
- **Request Body:** `{ "email": "developer@example.com" }`
- **Response (`200 OK`):** `{ "message": "Password reset email sent" }`.

### 8. Reset Password
- **Method / Route:** `POST /api/auth/reset-password`
- **Request Body:** `{ "token": "example-reset-token", "newPassword": "NewSecurePassword456!" }`
- **Response (`200 OK`):** `{ "message": "Password has been reset successfully" }`.

### 9. Inter-Service Administrative Endpoints (Internal Only)
- **Update User Role:** `PATCH /api/auth/internal/users/:userId/role` (body: `adminId`, `role`)
- **Delete User Account:** `DELETE /api/auth/internal/users/:userId` (body: `adminId`)

---

## 🔐 Environment Variables Specification

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `PORT` | Number | No | `5001` (or `10000` in prod) | HTTP listening port |
| `MONGO_URI` | String | Yes | — | MongoDB Atlas connection string |
| `JWT_SECRET` | String | Yes | — | Secret key used to sign access JWTs (15 min validity) |
| `JWT_REFRESH_SECRET`| String | Yes | — | Secret key used to sign refresh JWTs (7 day validity) |
| `INTERNAL_SECRET` | String | Yes | — | Shared secret verified by `InternalAuthGuard` |
| `GATEWAY_URL` | String | No | `http://localhost:3001` | Ingress gateway URL for password reset email links |
| `EMAIL` | String | Yes | — | Gmail sender address for Nodemailer SMTP |
| `PASSWORD` | String | Yes | — | 16-character Google App Password |
| `RECEIVER_EMAIL` | String | No | — | Optional backup notification email |

---

## 🛠️ Verification & Testing Commands

```bash
# Navigate to Auth Service directory
cd auth-service

# Run unit tests
npm run test

# Run e2e tests (requires local or ephemeral MongoDB)
npm run test:e2e

# Run linter
npm run lint

# Start development server
npm run start:dev
```

---

[Explore Portfolio Backend Microservice ➔](Service-Portfolio-Backend)
