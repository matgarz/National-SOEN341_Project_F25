# Server - Backend API

Express.js backend for the Campus Events platform with Prisma ORM and Azure MySQL.

## Tech Stack

- **Runtime:** Node.js v18+
- **Framework:** Express.js v5
- **Database:** Azure MySQL 8.0 (Cloud)
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **Language:** TypeScript (ES Modules)

## Database Setup - Azure MySQL

We use **Azure Database for MySQL** for team collaboration. Everyone connects to the same cloud database.

### Prerequisites

- Node.js v18+
- Access to team DATABASE_URL (get from Discord)

### Setup Instructions

1. **Install dependencies:**
```bash
   cd server
   npm install
