# 🔐 Microservice 2: Auth Service (Port 5001)

The **Auth Service** is a dedicated NestJS microservice responsible for user account lifecycle management, authentication, credential cryptography, secure JWT generation, and email verification workflows.

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
       │   Register & Verify    ││     Login & Tokens     ││   Recovery & Profile   │
       │• Bcrypt password hash  ││• Verify password hash  ││• Forgot password token │
       │• Verification token gen││• Issue Access Token    ││• Reset password hash   │
       │• SMTP Email via Gmail  ││• Issue Refresh Token   ││• /api/auth/me profile  │
       └───────────┬────────────┘└───────────┬────────────┘└───────────┬────────────┘
                   │                         │                         │
                   └─────────────────────────┼─────────────────────────┘
                                             ▼
                               ┌─────────────────────────────┐
                               │     MongoDB Atlas (User)    │
                               └─────────────────────────────┘
```

1. **User Identity & Cryptography:** Securely creates user accounts with salted password hashing using `bcrypt` (10 rounds).
2. **Account Verification:** Dispatches email verification links with cryptographic tokens using `nodemailer` through Gmail SMTP.
3. **Session Management (Dual-Token Pattern):**
   - **Access Token:** Short-lived JWT (15 minutes) signed with `JWT_SECRET`.
   - **Refresh Token:** Long-lived JWT (7 days) signed with `JWT_REFRESH_SECRET`, stored in secure HttpOnly cookies.
4. **Token Rotation & Logout:** Endpoint `/api/auth/refresh` rotates tokens without requiring re-login. Endpoint `/api/auth/logout` clears active session cookies.
5. **Password Recovery:** Time-expiring token generation (`resetPasswordExpires`) for secure password resets.
6. **Internal Security:** Protected by `InternalAuthGuard`, verifying that all requests contain the shared `x-internal-secret`.

---

## 📊 Database Schema: `User` Model

Defined in `src/auth/schemas/user.schema.ts` using Mongoose:

| Field Name | Type | Constraints | Description |
|---|---|---|---|
| `email` | `String` | `required: true`, `unique: true`, `lowercase: true`, `trim: true` | User email address used for login and notifications |
| `password` | `String` | `required: true` | Bcrypt hashed password string |
| `isVerified` | `Boolean` | `default: false` | Indicates whether email address has been verified |
| `verificationToken`| `String` | `default: null` | Cryptographic hex token sent in verification email |
| `resetPasswordToken`| `String`| `default: null` | One-time token used for password reset requests |
| `resetPasswordExpires`| `Date` | `default: null` | Expiration timestamp for reset token (1 hour) |
| `role` | `String` | `enum: ['user', 'admin']`, `default: 'user'` | Role claim embedded in JWT for role-based access control |
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
    "email": "developer@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "message": "User registered successfully. Please check your email to verify your account."
  }
  ```

### 2. Verify Email
- **Method / Route:** `POST /api/auth/verify-email`
- **Request Body:** `{ "token": "4a7b9e1c2d3f..." }`
- **Response (`200 OK`):** `{ "message": "Email verified successfully." }`

### 3. Login
- **Method / Route:** `POST /api/auth/login`
- **Request Body:** `{ "email": "developer@example.com", "password": "SecurePassword123!" }`
- **Response (`200 OK`):**
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "6704b2a8f102c91a823b49e1",
      "email": "developer@example.com",
      "role": "user"
    }
  }
  ```
  *Sets HttpOnly cookies `jwt` (access token) and `refreshToken` (refresh token).*

### 4. Refresh Tokens
- **Method / Route:** `POST /api/auth/refresh`
- **Cookies:** Reads `refreshToken`
- **Response (`200 OK`):** `{ "message": "Token refreshed successfully" }`

### 5. Logout
- **Method / Route:** `POST /api/auth/logout`
- **Response (`200 OK`):** Clears authentication cookies and returns `{ "message": "Logged out successfully" }`.

### 6. Get Current User Profile
- **Method / Route:** `GET /api/auth/me`
- **Headers:** Injected `x-user-id` from API Gateway
- **Response (`200 OK`):**
  ```json
  {
    "id": "6704b2a8f102c91a823b49e1",
    "email": "developer@example.com",
    "role": "user",
    "isVerified": true
  }
  ```

---

## 🔐 Environment Variables Specification

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `PORT` | Number | No | `5001` (or `10000` in prod) | HTTP listening port |
| `MONGO_URI` | String | Yes | — | MongoDB Atlas connection string |
| `JWT_SECRET` | String | Yes | — | Secret key used to sign access JWTs (15 min validity) |
| `JWT_REFRESH_SECRET`| String | Yes | — | Secret key used to sign refresh JWTs (7 day validity) |
| `INTERNAL_SECRET` | String | Yes | — | Shared secret verified by `InternalAuthGuard` |
| `GATEWAY_URL` | String | No | `http://localhost:3001` | Ingress gateway URL for constructing email verification links |
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
