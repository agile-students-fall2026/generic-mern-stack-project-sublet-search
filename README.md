# Sublet Search

Sublet Search is a mobile-friendly web application designed to help students and other renters find and advertise short-term housing. It brings sublet listings, property details, saved listings, user profiles, reviews, and communication features into one platform.

This project is developed for the Fall 2026 Agile Software Development & DevOps course at New York University.

## Product Vision

For students and renters seeking temporary housing, Sublet Search aims to provide an accessible way to discover available sublets, compare options, and communicate with people offering properties.

Instead of relying on scattered social media posts and disconnected listing platforms, users can find relevant housing information in one organized application.

We are developing the application incrementally using Scrum practices, including user stories, sprint planning, automated testing, code reviews, and stakeholder feedback.

## Features

The application currently includes frontend components and backend APIs for:

- Browsing and exploring sublet listings.
- Viewing listing details.
- Creating and managing sublet listings.
- Saving and removing favorite listings.
- User signup, login, and profile management.
- Profile verification fields and payment-method management.
- Submitting and viewing user reviews.
- Liking user reviews.
- Messaging and conversation functionality.

Some features are still undergoing frontend/backend integration and testing, including listing photo uploads, payment-method persistence, conversation creation from listings, and lease documents.

Additional functionality, such as map-based exploration, is part of the longer-term product vision.

## Technology Stack

**Frontend**
- React.js
- Vite
- JavaScript
- HTML and CSS
- Axios

**Backend**
- Node.js
- Express.js
- REST API endpoints
- In-memory JavaScript data

**Testing and Development**
- Mocha
- Chai
- Chai HTTP
- c8 for backend code coverage
- ESLint
- Git and GitHub

The project follows a MERN-style architecture, but **MongoDB is not yet integrated**. The current backend uses in-memory mock data rather than a persistent database.

## Project Structure

```text
generic-mern-stack-project-sublet-search/
├── front-end/       # React application
├── back-end/        # Express API, mock data, and automated tests
├── ux-design/       # UX design resources
├── README.md
└── CONTRIBUTING.md
```

## Getting Started

### Prerequisites

- Node.js and npm installed (frontend development has been tested with Node.js 24).
- Git installed.

### 1. Clone the repository

```bash
git clone https://github.com/agile-students-fall2026/generic-mern-stack-project-sublet-search.git
cd generic-mern-stack-project-sublet-search
```

### 2. Install backend dependencies

```bash
cd back-end
npm install
```

### 3. Start the backend

```bash
npm run dev
```

The Express backend runs at:

`http://localhost:3000`

Keep this terminal running.

### 4. Install frontend dependencies

Open a second terminal and navigate to the project directory.

```bash
cd front-end
npm install
```

### 5. Start the frontend

```bash
npm run dev
```

Open the local address displayed by Vite, usually:

`http://localhost:5173`

Both servers must be running for frontend features that use the backend API.

The Vite development server proxies API requests beginning with `/api` to the Express backend.

## Testing

### Backend Automated Tests

From the `back-end/` directory, run:

```bash
npm test
```

The backend test suite uses Mocha and Chai. The test command also runs c8 to report code coverage.

Tests cover functionality such as listings, saved listings, reviews, and conversations.

### Frontend Linting

From the `front-end/` directory, run:

```bash
npm run lint
```

This checks the frontend JavaScript and React code using ESLint.

### Frontend Production Build

From the `front-end/` directory, run:

```bash
npm run build
```

The compiled application is generated in `front-end/dist/`.

### Manual Testing

In addition to automated tests, the team tests user flows in the browser, including browsing listings, saving listings, using profiles, and interacting with backend-connected features.

When testing features that depend on the active user, use separate demo accounts to confirm that data is associated with the correct user.

## Current Development Limitations

Sublet Search is an academic prototype and is not intended for production use.

- Application data is stored in memory and generally resets when the backend restarts.
- MongoDB persistence has not been implemented.
- Authentication and user identity handling are simplified for development and testing.
- Some features are still being connected to the backend or verified through end-to-end testing.
- Payment-method functionality is a demonstration feature; the application does not process real payments.
- Password recovery is not a production-ready email-based reset system.
- Lease-document functionality is still being completed or evaluated for the sprint scope.

## Team Members

- [nianordv](https://github.com/nianordv)
- [jl15113](https://github.com/jl15113)
- [kh-noma](https://github.com/kh-noma)
- [tristange123](https://github.com/tristange123)

## Development Workflow

The team follows an Agile/Scrum workflow.

Development tasks are organized using GitHub Issues and sprint planning. Features and fixes are developed on separate branches and submitted through pull requests.

Before merging changes, contributors should verify the relevant functionality, run available tests, and follow the contribution guidelines.

See [CONTRIBUTING.md](CONTRIBUTING.md) for additional details.

## Project Resources

- [UX Design Documentation](UX-DESIGN.md)
- [App Map](ux-design/app-map.png)
- [UX Design Files](ux-design/)
- [GitHub Issues](https://github.com/agile-students-fall2026/generic-mern-stack-project-sublet-search/issues)