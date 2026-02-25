# BoilerMate

BoilerMate is a full-stack housing and roommate discovery platform tailored for the Purdue University community. It provides a centralized, secure environment for students to find compatible roommates and verified off-campus housing listings.

## Technical Stack

* **Frontend**: React, TypeScript, Vite, Axios, Tailwind CSS
* **Backend**: NestJS (Node.js), TypeScript
* **Database**: PostgreSQL, Prisma ORM
* **Infrastructure**: Supabase, NEON (Database Hosting), GitHub Actions (CI/CD)

## Project Architecture & Technical Decisions

The application utilizes an N-tier architecture to maintain a clear separation between the React-based presentation layer, the NestJS application logic, and the PostgreSQL data persistence layer.

### Why Relational (PostgreSQL) over NoSQL?
A relational structure was chosen to ensure strict data integrity. Features such as "Roommate Matching" and "Followers" rely on complex joins and foreign key constraints (such as Cascade Deletes) that require the ACID compliance and relational consistency provided by PostgreSQL.

### Infrastructure & DevOps
Maintaining a stable codebase in a multi-developer environment required a robust CI/CD pipeline:
* **CI/CD Pipeline**: Established GitHub Actions to automate builds and Prisma schema validation.
* **Environment Debugging**: Resolved native binding errors with @swc/core and addressed npm cache issues by implementing clean install and rebuild protocols within the CI runner.
* **Database Migration**: Migrated to Neon for development to improve connection reliability and simplify connection string architecture.

## Individual Contributions: Seokho (Ethan) Lee

As a core developer in a 5-member team, I focused on the platform's security, identity verification, and automated notification systems.

* **Domain-Locked Authentication**: Engineered a two-step email verification system restricted to @purdue.edu domains to ensure exclusive access for the university community.
* **Identity Verification Infrastructure**: Designed the VerificationRequest system and admin dashboard for reviewing Purdue ID uploads and managing user verification states.
* **Automated Notification Engine**: Architected the UserSettings schema and developed a backend engine to trigger automated email alerts for profile updates and outdated listings using scheduled tasks.
* **Account Lifecycle Management**: Implemented secure user reactivation flows and suspended account handling (UserStatus: ACTIVE, INACTIVE, SUSPENDED).

## Data Modeling Highlights

I contributed to the following relational structures to support platform trust and engagement:
* **VerificationRequest**: Managed the relationship between users and administrators for identity vetting.
* **UserSettings**: Provided a 1:1 relational link to the User model for individualized notification logic.
* **EmailVerification**: Developed a standalone model for secure, time-limited OTP verification.

## Setup and Installation

1. Clone the repository: `git clone https://github.com/lee3291/boilermate.git`
2. Install dependencies: `npm install` both in /backend and /frontend
3. Configure environment variables in a .env file (Supabase and PostgreSQL credentials).
4. Synchronize database with predefined commands: `npm prisma:migrate` and `npm prisma:generate`
5. In /backend, start: `npm run start:dev`
6. In /frontend, start: `npm run dev`
