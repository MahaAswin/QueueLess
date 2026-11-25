# QueueLess — Zero-Wait Campus & Retail Pickup Platform

QueueLess eliminates physical waiting lines by enabling pre-ordering, intelligent pickup slot allocation, and verified zero-friction counter collection using cryptographically signed QR codes and fallback OTPs.

---

## 🏗️ Repository Architecture

The project is structured as a unified full-stack monorepo:

```text
QueueLess/
├── backend/            # Spring Boot 3 + Java 21 REST API & Business Logic
├── web/                # React 19 + TypeScript + Vite Frontend (Capacitor-Ready)
├── .env.example        # Master environment variables template
├── .gitignore          # Repository-wide ignore rules
├── queueless_backup.sql# Database schema & sample seed data
└── README.md           # Project documentation & operational runbooks
```

### Key Modules & Capabilities
- **Customer Portal**: Browse nearby shops, inspect menu items, select pickup time-windows, checkout, and present dynamic verified QR pickup codes.
- **Merchant / Shop Owner Portal**: Catalog management, dynamic slot capacity configuration, live order queue processing, and one-tap camera QR / OTP order verification.
- **Admin Control Center**: System governance, account auditing, merchant verification, dispute mediation, dispute penalty thresholds, and analytical reporting.
- **Security & Persistence**: Stateless JWT access and refresh token authentication, BCrypt password hashing, role-based authorization (`ROLE_CUSTOMER`, `ROLE_SHOP_OWNER`, `ROLE_ADMIN`), and PostgreSQL persistence.

---

## 🚀 Backend Setup (Spring Boot)

### Prerequisites
- **Java Development Kit (JDK)**: Version 21 or higher
- **PostgreSQL**: Local PostgreSQL instance or a [Neon DB](https://neon.tech) cloud database

### Environment Configuration
Copy `.env.example` to `backend/.env` (or configure system environment variables):

```env
PORT=8080
DB_URL=jdbc:postgresql://localhost:5432/queueless
DB_USERNAME=postgres
DB_PASSWORD=your_password
SHOW_SQL=false
JWT_SECRET=your_secure_256_bit_secret_key_here
JWT_ACCESS_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000
CORS_ALLOWED_ORIGINS=https://queueless-rho-snowy.vercel.app,http://localhost:5173,http://localhost:3000
DEFAULT_ADMIN_EMAIL=admin@queueless.com
QR_EXPIRATION_MINUTES=30
OTP_EXPIRATION_MINUTES=3
OTP_MAX_FAILED_ATTEMPTS=5
USER_SUSPENSION_THRESHOLD=3
SHOP_SUSPENSION_THRESHOLD=3
```

### Running the Backend Locally
From the `backend/` directory:

```bash
# Windows
.\mvnw.cmd clean spring-boot:run

# Linux / macOS
./mvnw clean spring-boot:run
```

The REST API will be accessible at:
- **Base API**: `http://localhost:8080/api`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Docs**: `http://localhost:8080/v3/api-docs`

### Running Backend Tests
```bash
# Windows
.\mvnw.cmd test

# Linux / macOS
./mvnw test
```

---

## 💻 Web Frontend Setup (React + Vite)

### Prerequisites
- **Node.js**: Version 18.0.0 or higher (Node 20+ recommended)
- **npm**: Version 9.0.0 or higher

### Environment Configuration
Create `web/.env`:

```env
# URL pointing to the running backend service (without trailing slash)
VITE_API_URL=http://localhost:8080
```

### Installation & Development Server
From the `web/` directory:

```bash
# Install dependencies
npm install

# Start Vite hot-reloading development server
npm run dev
```

The web application runs at `http://localhost:5173`.

### Production Build
```bash
# Type-check and produce optimized production bundle in web/dist/
npm run build
```

---

## ☁️ Deployment Architecture

The production environment is deployed using modern cloud primitives:

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│         Vercel (Frontend)       │       │         Render (Backend)        │
│  React 19 + Vite Production SPA │──────>│  Spring Boot 3 Container Service│
│  https://queueless-rho-snowy... │  API  │  https://queueless-backend...   │
└─────────────────────────────────┘       └─────────────────────────────────┘
                                                           │
                                                           │ JDBC SSL
                                                           ▼
                                          ┌─────────────────────────────────┐
                                          │      Neon Cloud PostgreSQL      │
                                          │  Serverless Relational Database │
                                          └─────────────────────────────────┘
```

1. **Frontend Hosting (Vercel)**:
   - Root directory set to `web`.
   - Build command: `npm run build`, output directory: `dist`.
   - Client-side SPA routing managed via `vercel.json`.
   - `VITE_API_URL` environment variable configured in Vercel project settings.

2. **Backend Hosting (Render)**:
   - Docker or Native Java environment building from `backend/`.
   - Port provided via Render's dynamic `$PORT` environment variable.
   - Connected to Neon PostgreSQL with SSL (`sslmode=require`).

3. **Database (Neon PostgreSQL)**:
   - Managed serverless PostgreSQL with connection pooling.

---

## 📱 Capacitor Android Mobile Application

The QueueLess React + Vite application is integrated with **Capacitor 8** to run as a high-performance native Android application. It packages the bundled production web application locally inside the native Android WebView, communicating seamlessly with the production Render backend with full native hardware and OS integrations (GPS location, camera permissions, status bar styling, splash screen, and hardware back-button navigation).

### Development & Android Build Workflow

```bash
# 1. Navigate to the web frontend directory
cd web

# 2. Build the production React web bundle (outputs to dist/)
npm run build

# 3. Synchronize web assets and plugins to the Android project
npx cap sync android

# 4. Open the Android project in Android Studio
npx cap open android
```

### Direct Android Gradle Commands (from `web/android/`)
```bash
# Clean & assemble debug APK
cd web/android
.\gradlew.bat assembleDebug

# Output APK path:
# web/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🛡️ License

This project is licensed under the MIT License.
