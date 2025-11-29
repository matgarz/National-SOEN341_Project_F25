Sprint 1
Dates: Sept 13-Sept 17: 
I was involved in the initial 20 minutes meeting after class. 
With the discord server online for communication, I helped decide what languages and framwework may be used for the project.
I regularly discussed and checked the work being done on the github(roughly 20 minutes per session).

Sept 18: 
I attended the second group meeting where the finalisation of the projects frameworks and languages was going to be used for the project. 
I also began creating some user stories for the functionalities of the application (2 hours).

Sept 25: 
I created a meetings minutes document and request a pull of a folder containing all meeting minutes for sprint 1(30 minutes). 
At the lab tonight, the final details for sprint 1 will be finalised.

Overall time spent on project so far: 
20min + 20min*9days + 2hours + 0.5hour = 5 hours and 50 minutes.

Sprint 2
Database Infrastructure (Sept 26-30)

Sept 26-27:
- Attended initial Sprint 2 planning meeting (30 minutes)
- Reviewed Sprint 2 requirements and team task assignments
- Discussed database architecture approach with team on Discord (20 minutes daily check-ins)

Sept 28-29:
Designed complete Prisma schema with 7 database models (3 hours):
- User (authentication, roles: Student/Organizer/Admin)
- Organization (campus organizations)
- Event (capacity, pricing, categories, status workflow)
- Ticket (QR codes, check-in tracking, payment status)
- SavedEvent (calendar/bookmark functionality)
- Review (rating system 1-5 stars)
- VerificationToken (email verification, password reset)
Set up Azure MySQL cloud database using Concordia email (1 hour)
(Configured firewall rules for team access)

Sept 30:
Created Prisma migration files to establish all database tables (1 hour)
Built comprehensive seed script (prisma/seed.ts) with test data (2 hours):
Addressed team feedback on Pull Request regarding tsconfig.json changes (30 minutes)
Shared DATABASE_URL credentials securely with team via Discord

Daily Discord check-ins: ~20 minutes per day for 5 days = 1 hour 40 minutes

Oct 1:
Implemented GET /api/events API endpoint (1 hours):
Implemented GET /api/events/:id endpoint for single event details (0.5 hour)
Set up Express server configuration with proper CORS and middleware (1 hour)
Created events.routes.ts file

Oct 2:
Tested API endpoints locally (30 minutes)
Helped teammates troubleshoot database connection issues via Discord (0.25 hour)
Documented API response formats for frontend teams

Oct 11:
Built POST /api/events API endpoint for event creation (1.5 hours):
Implemented comprehensive input validation middleware (event.validator.ts)
Added validation for all fields (title, description, date, location, capacity, etc.)
Business rule validation (future dates, positive capacity, etc.)
Created reusable validation error handler (validationHandler.ts) (1 hour)
Implemented robust error handling (1 hour)
Updated database schema naming conventions to PascalCase for consistency (30 minutes)
Fixed Prisma relation field names (creator, organizer) (30 minutes)

Sprint 3

Oct 23:
- Attended Sprint 3 planning meeting (30 minutes)
- Reviewed Sprint 3 requirements and assigned tasks
- Daily Discord check-ins: ~20 minutes per day

Oct 25:
- Implemented Admin Dashboard comprehensive statistics display (2 hours)
- Built admin event moderation interface with approve/reject functionality (1 hour)
- Created platform analytics visualization using Recharts (1 hour)

Oct 27:
- Developed GET /api/admin/analytics/comprehensive endpoint (30 minutes)
- Implemented event filtering and search functionality for admin panel (1.5 hour)
- Built organization management features (view, edit, delete) (1.5 hour)

Nov 1:
- Created Analytics component with category distribution pie charts (1 hour)
- Restructured the database entitiy attributes and added new enum (1 hour)
- Implemented Admin calendar (1.5 hour)
- Admin create organization feature was implemented (1 hour)
