# Project Guidelines

## Architecture
- This workspace is a monorepo with `allure-frontend` as the Next.js storefront and admin UI, and `allure-backend` as the Express + Prisma API.
- Prefer real end-to-end integrations across frontend services, backend controllers, Prisma models, and admin/storefront pages. Do not leave features half-wired or mock-only when the task is to make a flow functional.
- When backend response shapes change, update the matching frontend types and service mappers in the same task.

## Conventions
- Keep guest and authenticated customer flows aligned where both exist. Do not add features that work only for signed-in users if the surrounding UX already supports guests.
- Treat admin and customer auth expiry as a handled product flow. Prefer refresh-and-retry patterns, clean logout, and redirect to login over surfacing raw Axios errors in the UI.
- For admin pages, implement the full operational flow: loading state, empty state, filters or search when needed, action handling, and success or error feedback.
- For storefront and account features, prefer data from the backend over placeholder content whenever the API already supports the feature.
- For review, order, payment, and custom-request work, preserve synchronization between admin moderation views and storefront or account-facing views.

## Code Style
- Keep changes focused and minimal. Fix the root cause instead of adding page-level workarounds when the issue comes from a shared service, controller, or data contract.
- Follow the existing mapping pattern in frontend services: define API types, map them into shared app types, and normalize enum or nullable values there.
- In backend controllers, return stable, UI-friendly payloads rather than forcing pages to reconstruct related context.

## Build And Test
- Backend setup commonly requires Prisma to be current. If runtime errors suggest schema drift, check migrations before patching around database issues.
- Frontend API base URL is expected to point to the backend `/api` root.