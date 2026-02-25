# BoilerMate

BoilerMate is a full-stack housing and roommate discovery platform tailored for the Purdue University community. It provides a centralized, secure environment for students to find compatible roommates and verified off-campus housing listings.

## Technical Stack

* **Frontend**: React, TypeScript, Vite, Axios, Tailwind CSS
* **Backend**: NestJS (Node.js), TypeScript
* **Database**: PostgreSQL, Prisma ORM
* **Infrastructure**: Supabase, NEON (Database Hosting), GitHub Actions (CI/CD)

## Project Architecture

The application utilizes an N-tier architecture to maintain a clear separation between the React-based presentation layer, the NestJS application logic, and the PostgreSQL data persistence layer. This modularity supports scalable feature development and secure data handling.

## Individual Contributions

**Seokho (Ethan) Lee — Full-Stack Software Engineer**

As a core developer in a 5-member team, I focused on the development of the platform's security, identity verification, and automated notification systems.

* **Domain-Locked Authentication**: Engineered a two-step email verification system (EmailVerification model) restricted to @purdue.edu domains, ensuring exclusive access for the university community.
* **Identity Verification Infrastructure**: Designed and implemented the VerificationRequest system, enabling users to submit IDs for manual admin review. Developed the admin dashboard for auditing requests and managing user verification states (PENDING, APPROVED, DECLINED).
* **Automated Notification Engine**: Architected the UserSettings schema to manage granular communication preferences. Developed a backend engine to trigger automated email alerts for profile updates, new followers, and outdated property listings using scheduled tasks.
* **Account Lifecycle Management**: Implemented secure user reactivation flows and suspended account handling (UserStatus: ACTIVE, INACTIVE, SUSPENDED) to maintain platform safety and moderation standards.
* **CI/CD & DevOps**: Established CI testing pipelines via GitHub Actions to protect the main branch and resolved environment-specific configuration issues to streamline team development.

## Data Modeling Highlights

I contributed to the following relational structures to support platform trust and engagement:
* **VerificationRequest**: Managed the relationship between users and administrators for identity vetting.
* **UserSettings**: Provided a 1:1 relational link to the User model for managing individualized notification logic.
* **EmailVerification**: Developed a standalone model for secure, time-limited OTP (One-Time Password) verification.

## Setup and Installation

1. Clone the repository: `git clone https://github.com/lee3291/boilermate.git`
2. Install dependencies: `npm install`
3. Configure environment variables in a .env file (Supabase and PostgreSQL credentials).
4. Synchronize database: `npx prisma generate` and `npx prisma db push`
5. Start the development server: `npm run start:dev`
