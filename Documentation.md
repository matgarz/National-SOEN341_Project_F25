## Project Overview

Campus Events Organization & Registration Website - a full-stack TypeScript application for managing campus events with role-based access control (Students, Organizers, Admins).

**Stack:**
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Express.js (Node.js) + TypeScript
- Database: Azure MySQL 8.0 (Cloud) via Prisma ORM
- Authentication: JWT + bcrypt

## Development Commands

### Root (Workspace)
```bash
# Install all dependencies (client + server)
npm install

# Run both client and server concurrently
npm run dev

# Build both client and server
npm run build

# Run production server only
npm start
```

### Client (`client/`)
```bash
# Run development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Lint TypeScript/React code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check code formatting
npm run format

# Auto-format code
npm run format:fix

# Type-check without building
npx tsc -b --noEmit
```

### Server (`server/`)
```bash
# Run development server with hot reload (http://localhost:3001)
npm run watch

# Run development server (no hot reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production server
npm start

# Lint TypeScript code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check code formatting
npm run format

# Auto-format code
npm run format:fix
```

### Database (Prisma)
```bash
# Navigate to server directory first
cd server

# Generate Prisma Client after schema changes
npx prisma generate

# Push schema changes to Azure database
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Run database seed
npx prisma db seed

# Create and apply migrations (preferred for production)
npx prisma migrate dev --name <migration_name>
```

## Architecture

### Monorepo Structure
- Uses npm workspaces with `client/` and `server/` packages
- Shared database connection via Azure MySQL (team collaboration)
- Frontend communicates with backend via REST API at `/api/*` endpoints

### Backend Architecture (`server/src/`)

**Entry Point:** `server.ts`
- Configures Express with CORS for frontend origin (default: `http://localhost:5173`)
- Listens on port 3001
- Loads environment variables via dotenv

**Routes:**
- `/api/events` - Event CRUD operations, search, filtering
- `/api/auth` - Login, registration, token refresh
- `/api/admin` - User management, event moderation, analytics
- `/api/admin/organizations` - Organization management

**Middleware:**
- `auth/jwtAuth.ts` - JWT token generation/validation (30m access, 14d refresh tokens)
- `auth/loginAuth.ts` - Login authentication logic
- `auth/signupAuth.ts` - User registration validation
- `auth/roleAuth.ts` - Role-based access control
- `validators/event.validator.ts` - Event creation validation
- `validationHandler.ts` - Express-validator error handling

**Database Access:**
- All routes instantiate `PrismaClient` directly
- Models: `user`, `event`, `ticket`, `organization`, `review`, `savedevent`
- Key relations: Users belong to organizations, events have creators and organizations

### Frontend Architecture (`client/src/`)

**Entry Point:** `App.tsx` with `router.tsx` for routing

**Authentication Flow:**
- `auth/AuthContext.tsx` - React Context for global auth state
- User data persisted in localStorage
- Role-based route protection via `ProtectedRoute` wrapper
- Roles: STUDENT, ORGANIZER, ADMIN

**Routes:**
- `/` - Auto-redirects based on user role
- `/login`, `/register` - Public authentication pages
- `/student-dashboard` - Student event browsing, tickets, calendar
- `/organizer-dashboard` - Event management, analytics, QR validation
- `/admin-dashboard` - User/org management, event moderation, global stats
- `/create-event` - Event creation form (organizers/admins)
- `/calendar` - Personal event calendar (all roles)

**Components (`client/src/components/`):**
- Role-specific dashboards: `StudentDashboard`, `OrganizerDashboard`, `AdminDashboard`
- Admin features: `AdminUserManagement`, `AdminEventModeration`, `AdminOrganizations`
- Event components: `EventCard`, `Eventlist`, `OrganizerCreateEvent`, `QRCode`
- Shared: `Header`, `FilterSidebar`, `Calendar`, `Analytics`
- UI primitives in `components/ui/` (Radix UI + Tailwind)

**State Management:**
- No global state library (Redux/Zustand)
- Auth state via React Context
- Component-level state with useState/useEffect
- API calls directly from components using fetch

### Database Schema (Prisma)

**Core Models:**
- `user` - email, password (hashed), role (STUDENT/ORGANIZER/ADMIN), optional organizationId
- `event` - title, description, date, location, capacity, ticketType/Price, status (PENDING/APPROVED/REJECTED/CANCELLED/COMPLETED)
- `ticket` - qrCode (unique), claimed, checkedIn, paymentStatus
- `organization` - name (unique), description, contactEmail, isActive
- `review` - rating, comment (event reviews)
- `savedevent` - user's saved/bookmarked events

**Key Relationships:**
- Events belong to organizations and have a creator (user)
- Users can belong to organizations (organizers)
- Tickets link users to events (one ticket per user per event)
- All relations use CASCADE delete

## Environment Variables

**Server (`server/.env`):**
- `DATABASE_URL` - Azure MySQL connection string (obtain from team Discord)
- `ACCESS_SECRET` - JWT access token secret
- `REFRESH_SECRET` - JWT refresh token secret
- `FRONTEND_ORIGIN` - CORS origin (default: `http://localhost:5173`)

**Client:**
- API URL hardcoded as `http://localhost:3001` in components (search for `VITE_API_URL` if changing)

## Development Workflow

1. **Setup:**
   - Clone repo and run `npm install` at root
   - Get `DATABASE_URL` from team (shared Azure MySQL instance)
   - Create `server/.env` with required secrets

2. **Running locally:**
   - Run `npm run dev` from root (starts both client and server)
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

3. **Database changes:**
   - Edit `server/prisma/schema.prisma`
   - Run `npx prisma generate` to update Prisma Client
   - Run `npx prisma db push` (or `migrate dev` for versioned migrations)

4. **Before committing:**
   - Run `npm run lint` in both `client/` and `server/`
   - Run `npm run format` in both `client/` and `server/`
   - Fix any issues with `:fix` variants

5. **Testing:**
   - No test framework currently configured (placeholder scripts exit 0)

## Common Patterns

### API Requests (Frontend)
```typescript
const response = await fetch(`http://localhost:3001/api/events`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(eventData)
});
```

### Database Queries (Backend)
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const events = await prisma.event.findMany({
  where: { status: 'APPROVED' },
  include: { organization: true, user: true }
});
```

### Role-Based Access (Backend)
```typescript
// Routes typically don't enforce role checks server-side yet
// Most authorization happens in frontend routing
```

### Authentication Flow
1. User registers via `/api/auth/register` (creates user in database)
2. User logs in via `/api/auth/login` (returns user object without tokens currently)
3. Frontend stores user in localStorage and AuthContext
4. Protected routes check `user.role` for access control

## Important Notes

- **Shared Database:** All developers connect to the same Azure MySQL instance - be cautious with schema changes and data modifications
- **No JWT in Frontend:** Despite backend JWT infrastructure, frontend doesn't currently use Authorization headers - auth state is localStorage only
- **Port Conflicts:** Backend runs on 3001, frontend on 5173 - ensure these ports are available
- **ES Modules:** Both client and server use `"type": "module"` - use `.js` extensions in imports
- **Windows Development:** This project is developed on Windows - path separators and line endings may differ on Unix systems
