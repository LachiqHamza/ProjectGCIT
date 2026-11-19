# Backend and Database Recommendation

## Recommended stack

- **Backend:** TypeScript using the existing Next.js App Router
- **Database:** PostgreSQL
- **ORM/query layer:** Drizzle ORM
- **Hosting:** Vercel or another managed Node.js host with managed PostgreSQL
- **Optional later:** Rust for specialized high-performance services

## Why this fits GCIT

GCIT is currently a Next.js architecture portfolio with a Three.js villa viewer. The application is mostly static, so 3D performance depends mainly on browser GPU usage, model size, textures, and lazy loading—not on the backend language.

Next.js already supports Route Handlers and Server Actions, so contact forms, project management, authentication, analytics, and admin features can be added without introducing a separate backend stack.

PostgreSQL is the recommended database because it is mature, reliable, fast, and well suited to structured project data. It also supports row-level security policies for restricting records by user or organization.

Rust provides excellent memory safety and raw performance, but adding it now would increase complexity without a clear benefit. Consider Rust later for high-volume APIs, real-time collaboration, image/3D processing, or computational services.

## Recommended architecture

```text
Next.js + TypeScript
 ├─ Server Components
 ├─ Route Handlers / Server Actions
 ├─ Authentication
 ├─ Drizzle ORM
 └─ PostgreSQL
```

## Decision

Keep the current Next.js frontend and add a TypeScript backend with PostgreSQL when the project needs dynamic features.

Avoid C/C++ for this project. Avoid MongoDB unless the data becomes highly unstructured. Avoid building a separate Rust backend until measurements show that Next.js is the bottleneck.

## Suggested future implementation order

1. Add authentication only when an admin or private area is needed.
2. Add PostgreSQL and Drizzle when project/contact data must be persisted.
3. Add validation, authorization, rate limiting, secure cookies, and audit logging.
4. Measure real bottlenecks before introducing a separate Rust service.
