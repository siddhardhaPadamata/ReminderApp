# ReminderApp — Full-Stack Bill & Warranty Management Platform

ReminderApp is a containerized full-stack personal finance and asset tracking application built with **ASP.NET Core**, **React (TypeScript)**, **PostgreSQL**, and **Redis**. It enables users to track recurring bills, manage product warranties, attach digital receipts, and receive automated due-date notifications.

---

## Key Features

* **Secure Authentication & Session Rotation:**
  * Supports registration and login via Email or Phone Number with **BCrypt** password hashing.
  * Stateless **JWT Bearer** access tokens (15-minute lifespan) paired with **7-day refresh token rotation** stored in **Redis**.
  * Automatic silent token refresh via Axios interceptors with concurrent request queuing, plus server-side token revocation on logout.
* **Bill & Warranty Lifecycle Management:**
  * Full CRUD operations for tracking recurring bills, categories, payment amounts, due dates, and warranty expiration periods.
  * Support for uploading and serving digital invoices and warranty receipts (`IFileStorageService`).
* **Automated Background Reminders:**
  * Built-in hosted worker (`ReminderBackgroundService` implementing `IHostedService`) that periodically evaluates upcoming bill due dates and warranty expirations to dispatch reminder notifications (`INotificationService`).
* **Containerized Multi-Service Architecture:**
  * Orchestrated via **Docker Compose** across four isolated services with automated Entity Framework Core database migrations on startup.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | C#, ASP.NET Core Web API (.NET 10), Entity Framework Core, `IHostedService` |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, Axios |
| **Database & Cache** | PostgreSQL 16 (Relational Persistence), Redis 7 (Distributed Refresh Token Cache) |
| **Infrastructure & Proxy** | Docker, Docker Compose, Nginx |
| **Security** | JWT Bearer Authentication, BCrypt.Net, CORS Policy Isolation |

---

## System Architecture

```text
+-------------------+       HTTP / REST       +------------------------+
|                   | ----------------------> |                        |
|  React + Vite SPA |                         |  ASP.NET Core Web API  |
|  (Nginx / :5173)  | <---------------------- |  (Kestrel / :5154)     |
|                   |      JSON + JWT         |                        |
+-------------------+                         +-----------+------------+
                                                          |
                                      +-------------------+-------------------+
                                      |                                       |
                                      v                                       v
                        +---------------------------+           +---------------------------+
                        |       PostgreSQL 16       |           |          Redis 7          |
                        |  Users, Bills, Warranties |           |  7-Day Refresh Tokens     |
                        +---------------------------+           +---------------------------+
```

### Authentication Flow
1. **Sign In / Register:** The API validates credentials, generates a 15-minute JWT access token and a 64-byte cryptographic refresh token, caches the refresh token in Redis (`refresh:{userId}` with a 7-day TTL), and returns both to the client.
2. **Authorized Requests:** An Axios request interceptor attaches `Authorization: Bearer <accessToken>` to all outbound API requests.
3. **Silent Token Rotation:** When an access token expires (`401 Unauthorized`), an Axios response interceptor queues parallel requests, exchanges `{ userId, refreshToken }` at `POST /api/auth/refresh`, updates storage, and retries the original requests seamlessly.

---

## Project Structure

```text
ReminderApp/
├── ReminderApp.Api/              # ASP.NET Core Web API
│   ├── BackgroundJobs/           # Hosted reminder scheduler (ReminderBackgroundService)
│   ├── Controllers/              # Auth, Bills, and Warranties REST endpoints
│   ├── Data/                     # EF Core AppDbContext & Migrations
│   ├── DTOs/                     # Request/Response data transfer records
│   ├── Models/                   # Domain entities (User, Bill, Warranty)
│   ├── Services/                 # TokenService (JWT/Redis), FileStorage, Notifications
│   ├── Dockerfile                # Multi-stage .NET build & runtime image
│   └── Program.cs                # DI, JWT validation, CORS, and auto-migration pipeline
├── reminder-client/              # React + TypeScript Frontend
│   ├── src/
│   │   ├── api/                  # Axios client with silent refresh interceptors
│   │   ├── components/           # UI views including AuthScreen & Dashboards
│   │   └── services/             # Typed API service wrappers
│   ├── Dockerfile                # Multi-stage Node build & Nginx server
│   └── nginx.conf                # Reverse proxy & SPA fallback routing
└── docker-compose.yml            # Multi-container orchestration
```

---

## Getting Started (Docker Setup)

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Docker Compose v2+)
* [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/ReminderApp.git
cd ReminderApp
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (or verify the environment values in `docker-compose.yml`):

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YourStrongPassword123!
POSTGRES_DB=reminderdb
JWT_KEY=ReplaceWithASecure64CharacterSecretSigningKeyForJWTGeneration12345
```

### 3. Build and Start All Containers
```bash
docker compose up -d --build
```

Docker Compose will start all four services (`postgres`, `redis`, `api`, and `frontend`) and automatically apply pending EF Core migrations to PostgreSQL on startup.

### 4. Access the Application
* **Frontend UI:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:5154](http://localhost:5154)

### Useful Docker Commands
```bash
# View running containers
docker compose ps

# Follow API and background reminder logs
docker compose logs -f api

# Stop all containers
docker compose down
```

---

## API Overview

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | Public | Create a new account and issue token pair |
| `POST` | `/api/auth/login` | Public | Authenticate via email or phone and issue token pair |
| `POST` | `/api/auth/refresh` | Public | Rotate refresh token and issue new access token |
| `POST` | `/api/auth/logout/{userId}` | Bearer | Revoke refresh token in Redis |
| `GET` | `/api/bills` | Bearer | Retrieve all bills for the authenticated user |
| `POST` | `/api/bills` | Bearer | Create a new bill reminder |
| `GET` | `/api/warranties` | Bearer | Retrieve all product warranties for the user |
| `POST` | `/api/warranties` | Bearer | Register a new warranty record |

---

## Future Enhancements
* Cloud deployment on AWS EC2 with Nginx reverse proxying and Let's Encrypt SSL/TLS termination.
* Email and SMS reminder delivery integration via SendGrid / Twilio.
* Automated OCR extraction for uploaded bill and warranty receipts.
