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

## 📱 Future Capacitor Mobile Integration

The standalone legacy React Native / Expo application has been decommissioned. In the next phase, native Android and iOS mobile applications will be built using **Capacitor**, wrapping the existing responsive React + Vite web frontend.

### Benefits of Capacitor Architecture
- **Single Source of Truth**: 100% shared code, design system, and business logic between Web and Mobile.
- **Zero API Duplication**: Consumes the exact same Spring Boot REST endpoints.
- **Native Hardware Access**: Camera for QR code scanning, biometrics, and push notifications via standard Capacitor plugins.
- **Backend CORS Readiness**: The Spring Boot backend (`SecurityConfig.java`) is pre-configured to accept requests from Capacitor origins:
  - `capacitor://localhost` (iOS)
  - `http://localhost` (Android WebView)
  - `ionic://localhost`

### Setup Workflow for Capacitor (Future Step)
When ready to package for iOS and Android:

```bash
# 1. Inside the web/ directory, install Capacitor dependencies
cd web
npm install @capacitor/core @capacitor/cli @capacitor/camera @capacitor/preferences

# 2. Initialize Capacitor project configuration
npx cap init QueueLess com.queueless.app --web-dir dist

# 3. Add native platforms
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios

# 4. Build the web application and sync to native shells
npm run build
npx cap sync

# 5. Open in Native IDEs to build APK / IPA
npx cap open android   # Launches Android Studio
npx cap open ios       # Launches Xcode (macOS only)
```

---

## 🛡️ License

This project is licensed under the MIT License.
