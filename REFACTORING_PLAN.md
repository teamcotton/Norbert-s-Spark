# Next.js Architecture Refactoring Plan

## Current Architecture Analysis

### Current Flow (Duplicate Code Path)

```
Client Component (Browser)
    ↓
Client Hook (useRegistrationForm.ts)
    ↓
Application Action (registerUser.ts) ← fetch to /api/register
    ↓
Next.js API Route (/app/api/register/route.ts) ← fetch to backend
    ↓
Backend Fastify API (localhost:3000/users/register)
```

### Problems Identified

1. **Double Network Hop**: Client → Next.js API → Backend API
2. **Duplicate Error Handling**: Error handling in both API route and application action
3. **Duplicate HTTP Logic**: SSL handling, response parsing in multiple places
4. **Unnecessary Middleware Layer**: API routes serving only as proxy
5. **Performance Overhead**: Extra latency from intermediate Next.js API layer
6. **Code Duplication**: Similar fetch logic, error mapping, response transformation

---

## Proposed Architecture

### Option 1: Server Actions (Recommended for Next.js 13+)

```
Client Component (Browser)
    ↓
Server Action (server-side function with 'use server')
    ↓
Backend Fastify API (direct call, no intermediate layer)
    ↓
Return serialized data to client
```

**Benefits:**

- Single network hop (server-side only)
- Automatic serialization/deserialization
- Type-safe end-to-end
- Built-in Next.js optimizations
- No client-side API route needed

**Trade-offs:**

- Server Actions must be serializable (no class instances, functions, etc.)
- Requires Next.js 13.4+ with App Router
- Different mental model from traditional REST APIs

---

### Option 2: Server Components + Data Fetching

```
Server Component (RSC)
    ↓
Direct Backend API Call (fetch in Server Component)
    ↓
Backend Fastify API
    ↓
Render on server, stream to client
```

**Benefits:**

- Zero client-side JavaScript for data fetching
- Server-side rendering with fresh data
- Direct backend communication
- No intermediate API routes

**Trade-offs:**

- Requires page-level refactor (not hook-based)
- Client interactivity needs separate client components
- Form submissions require Server Actions or API routes

---

### Option 3: Unified API Client (Infrastructure Layer)

```
Client Hook
    ↓
Application Action (thin orchestration)
    ↓
Infrastructure API Client (shared fetch logic)
    ↓
Backend Fastify API (direct call from server)
```

**Benefits:**

- DRY principle: Single source of truth for API calls
- Centralized error handling
- Consistent response transformation
- Works with current architecture
- Gradual migration path

**Trade-offs:**

- Still requires Next.js API routes for client-side calls (CORS)
- Doesn't eliminate double hop for client-initiated requests

---

## Recommended Refactoring Steps

### Phase 1: Migrate to Server Actions (Primary Strategy)

#### Step 1: Create Server Action Infrastructure

**Location:** `apps/frontend/src/application/actions/server/`

**Files to Create:**

- `registerUser.server.ts` - Server Action for user registration
- `findAllUsers.server.ts` - Server Action for fetching users
- `baseServerAction.ts` - Shared utilities (error handling, logging, SSL handling)

**Key Changes:**

```typescript
// apps/frontend/src/application/actions/server/registerUser.server.ts
'use server'

import { logger } from '@/application/services/log-layer.server.js'
import type { RegisterUserData, RegisterUserResponse } from '@/domain/auth/index.js'

export async function registerUserAction(data: RegisterUserData): Promise<RegisterUserResponse> {
  // Direct backend call - no intermediate API route
  // SSL handling logic moved here
  // Single source of error handling
}
```

**Benefits:**

- Eliminates `/app/api/register/route.ts` entirely
- Direct server-to-server communication
- Single error handling location
- Type-safe without manual JSON parsing

---

#### Step 2: Update Client Hooks to Use Server Actions

**Files to Modify:**

- `apps/frontend/src/view/hooks/useRegistrationForm.ts`
- `apps/frontend/src/view/hooks/useAdminPage.ts`

**Key Changes:**

```typescript
// apps/frontend/src/view/hooks/useRegistrationForm.ts
import { registerUserAction } from '@/application/actions/server/registerUser.server.js'

export function useRegistrationForm() {
  // ... existing state management

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      try {
        // Direct call to Server Action - no fetch needed
        const result = await registerUserAction(formData)

        // Server Action handles all backend communication
        // Error handling simplified - single source of truth
        if (result.success) {
          // Success handling
        } else {
          // Map server errors to UI errors
        }
      } finally {
        setIsSubmitting(false)
      }
    }
  }
}
```

**Benefits:**

- Remove `apps/frontend/src/application/actions/registerUser.ts` (fetch-based)
- Hooks directly call Server Actions
- No client-side fetch boilerplate

---

#### Step 3: Centralize Backend Communication Logic

**Location:** `apps/frontend/src/infrastructure/backend/`

**Files to Create:**

- `backendClient.server.ts` - Shared backend fetch logic (SSL, error handling, logging)
- `errorMapper.ts` - Maps backend errors to domain errors
- `responseTransformer.ts` - Transforms backend responses to domain types

**Key Changes:**

```typescript
// apps/frontend/src/infrastructure/backend/backendClient.server.ts
import https from 'https'
import { logger } from '@/application/services/log-layer.server.js'

export interface BackendRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  endpoint: string
  body?: unknown
  signal?: AbortSignal
}

export async function backendRequest<T>(options: BackendRequestOptions): Promise<T> {
  const apiUrl = process.env.BACKEND_AI_CALLBACK_URL

  if (!apiUrl) {
    throw new Error('BACKEND_AI_CALLBACK_URL not configured')
  }

  // SSL handling logic (once)
  // Error logging (once)
  // Response parsing (once)
  // Type-safe return
}
```

**Benefits:**

- Single location for SSL certificate handling
- Unified error logging with LogLayer
- DRY: No duplicate fetch logic
- Centralized backend URL management

---

#### Step 4: Implement Consistent Error Handling

**Location:** `apps/frontend/src/application/errors/`

**Files to Create:**

- `apiErrors.ts` - Domain-specific error types
- `errorHandler.server.ts` - Server-side error handler
- `errorMapper.ts` - Backend → Domain error mapping

**Key Changes:**

```typescript
// apps/frontend/src/application/errors/apiErrors.ts
export class ConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// apps/frontend/src/application/errors/errorMapper.ts
export function mapBackendError(status: number, message: string) {
  switch (status) {
    case 409:
      return new ConflictError(message)
    case 400:
      return new ValidationError(message)
    default:
      return new Error(message)
  }
}
```

**Benefits:**

- Type-safe error handling
- Consistent error messages across app
- Single source of truth for error mapping
- Easier to test error scenarios

---

#### Step 5: Update Tests

**Files to Modify:**

- `apps/frontend/src/test/view/hooks/useRegistrationForm.test.ts`
- `apps/frontend/src/test/view/components/RegistrationForm.test.tsx`

**Files to Delete:**

- `apps/frontend/src/test/app/api/register/route.test.ts` (no longer needed)
- `apps/frontend/src/test/app/api/users/route.test.ts` (no longer needed)
- `apps/frontend/src/test/application/actions/registerUser.test.ts` (replaced by server action tests)
- `apps/frontend/src/test/application/actions/findAllUsers.test.ts` (replaced by server action tests)

**Files to Create:**

- `apps/frontend/src/test/application/actions/server/registerUser.server.test.ts`
- `apps/frontend/src/test/application/actions/server/findAllUsers.server.test.ts`
- `apps/frontend/src/test/infrastructure/backend/backendClient.server.test.ts`

**Key Changes:**

```typescript
// Test Server Actions directly
import { registerUserAction } from '@/application/actions/server/registerUser.server.js'

describe('registerUserAction', () => {
  it('should register user successfully', async () => {
    // Mock backend response
    // Test server action
    // Verify result
  })
})
```

**Benefits:**

- Test coverage moves to server actions
- Remove redundant API route tests
- Fewer test files (no duplication)
- Faster test execution (no HTTP layer)

---

### Phase 2: Migrate Data Fetching to Server Components (Optional Enhancement)

#### Step 6: Convert Admin Page to Server Component

**Files to Modify:**

- `apps/frontend/src/app/admin/page.tsx` - Convert to Server Component

**Key Changes:**

```typescript
// apps/frontend/src/app/admin/page.tsx
// Remove 'use client' directive

import { findAllUsersAction } from '@/application/actions/server/findAllUsers.server.js'

export default async function AdminPage() {
  // Fetch data on server
  const usersResult = await findAllUsersAction({ limit: 100, offset: 0 })

  // Pass data to client component for interactivity
  return <AdminClientComponent initialData={usersResult} />
}
```

**Files to Create:**

- `apps/frontend/src/view/components/AdminClientComponent.tsx` - Client-side table interactions

**Benefits:**

- Initial data fetched on server (faster first paint)
- SEO-friendly (if needed)
- Reduced client JavaScript bundle
- Pagination/filtering via Server Actions

---

### Phase 3: Clean Up Old Code

#### Step 7: Remove Deprecated Files

**Files to Delete:**

- `apps/frontend/src/app/api/register/route.ts`
- `apps/frontend/src/app/api/users/route.ts`
- `apps/frontend/src/application/actions/registerUser.ts`
- `apps/frontend/src/application/actions/findAllUsers.ts`

**Environment Variables to Remove:**

- `NEXT_PUBLIC_BASE_URL` (no longer needed for client-side API calls)

**Benefits:**

- Reduced bundle size
- Simpler mental model
- Less code to maintain
- Fewer potential security issues (no public API routes)

---

#### Step 8: Update Documentation

**Files to Update:**

- `DEVELOPMENT.md` - Update architecture section
- `.github/copilot-instructions.md` - Update DDD architecture guidance
- `README.md` - Update getting started guide

**Key Changes:**

- Document Server Action architecture
- Update file organization guidelines
- Add migration guide for future features
- Update testing strategy

---

## Migration Checklist

### Before You Start

- [ ] Ensure Next.js version is 13.4+ (check `apps/frontend/package.json`)
- [ ] Verify `serverActions` is enabled in `next.config.ts`
- [ ] Create feature branch: `git checkout -b refactor/server-actions`
- [ ] Run all tests to establish baseline: `pnpm run test`

### Phase 1: Server Actions Setup

- [ ] Create `apps/frontend/src/infrastructure/backend/backendClient.server.ts`
- [ ] Create `apps/frontend/src/application/errors/apiErrors.ts`
- [ ] Create `apps/frontend/src/application/errors/errorMapper.ts`
- [ ] Create `apps/frontend/src/application/actions/server/registerUser.server.ts`
- [ ] Create `apps/frontend/src/application/actions/server/findAllUsers.server.ts`
- [ ] Write tests for new infrastructure layer
- [ ] Run tests: `pnpm test:unit`

### Phase 2: Update Hooks

- [ ] Update `useRegistrationForm.ts` to use Server Action
- [ ] Update `useAdminPage.ts` to use Server Action
- [ ] Run tests: `pnpm test:unit`
- [ ] Manual testing: Registration flow
- [ ] Manual testing: Admin page

### Phase 3: Clean Up

- [ ] Delete old API routes (`apps/frontend/src/app/api/register/route.ts`, `apps/frontend/src/app/api/users/route.ts`)
- [ ] Delete old actions (`registerUser.ts`, `findAllUsers.ts`)
- [ ] Delete old tests
- [ ] Remove `NEXT_PUBLIC_BASE_URL` references
- [ ] Run full test suite: `pnpm run test`
- [ ] Run linter: `pnpm run lint`
- [ ] Run type checker: `pnpm run typecheck`

### Phase 4: E2E Validation

- [ ] Run E2E tests: `pnpm test:e2e`
- [ ] Test registration flow end-to-end
- [ ] Test admin page with pagination
- [ ] Test error scenarios (duplicate email, network errors)
- [ ] Verify SSL certificate handling in development

### Phase 5: Documentation

- [ ] Update `DEVELOPMENT.md`
- [ ] Update `.github/copilot-instructions.md`
- [ ] Update `README.md`
- [ ] Add migration notes to commit message
- [ ] Create PR with detailed description

---

## Expected Outcomes

### Performance Improvements

- **Reduced Latency**: Eliminate one network hop (Client → API Route removed)
- **Smaller Bundle**: Remove client-side fetch boilerplate (~2-3 KB)
- **Faster Execution**: Server-to-server calls are faster than server-to-client-to-server

### Code Quality Improvements

- **Lines of Code Removed**: ~200-300 lines (API routes + duplicate actions)
- **Test Files Reduced**: 4 test files consolidated to 2
- **Cyclomatic Complexity**: Lower complexity (single error handling path)
- **Type Safety**: End-to-end type safety without manual JSON parsing

### Developer Experience Improvements

- **Single Source of Truth**: Error handling in one place
- **Easier Debugging**: Fewer layers to trace through
- **Simpler Mental Model**: Direct server-to-backend calls
- **Better DRY Compliance**: No duplicate fetch/error logic

### Maintainability Improvements

- **Fewer Files**: Less code to maintain and update
- **Clearer Architecture**: Follows Next.js best practices
- **Future-Proof**: Aligned with Next.js 13+ patterns
- **Testability**: Easier to mock and test (fewer integration points)

---

## Alternative Approach: Keep API Routes (If Required)

If you **must** keep API routes (e.g., for external API consumers, webhooks, or third-party integrations), follow this hybrid approach:

### Hybrid Step 1: Create Shared Backend Client

**Location:** `apps/frontend/src/infrastructure/backend/backendClient.server.ts`

Both Server Actions **and** API Routes import this shared client.

### Hybrid Step 2: Thin API Routes

API routes become thin wrappers:

```typescript
// apps/frontend/src/app/api/register/route.ts
import { registerUserAction } from '@/application/actions/server/registerUser.server.js'

export async function POST(request: Request) {
  const body = await request.json()
  const result = await registerUserAction(body)
  return Response.json(result, { status: result.success ? 200 : 400 })
}
```

### Hybrid Step 3: Client Hooks Use Server Actions Directly

Hooks bypass API routes and call Server Actions:

```typescript
// useRegistrationForm.ts
import { registerUserAction } from '@/application/actions/server/registerUser.server.js'

const result = await registerUserAction(formData) // Direct call
```

**Benefits:**

- API routes exist for external consumers
- Internal app uses Server Actions (no double hop)
- Shared backend client (DRY)
- Gradual migration path

---

## Risk Assessment

### Low Risk

- Creating new Server Actions alongside existing code
- Adding shared infrastructure layer
- Writing tests for new code

### Medium Risk

- Updating hooks to use Server Actions (breaking change for component API)
- Deleting API routes (ensure no external dependencies)
- Changing error handling flow (requires thorough testing)

### High Risk

- Migrating to Server Components (requires page-level refactor)
- Removing `NEXT_PUBLIC_BASE_URL` (verify no external usage)
- Changing authentication flow (not covered in this plan)

### Mitigation Strategies

1. **Feature Flag**: Add temporary feature flag to toggle between old/new implementation
2. **Incremental Rollout**: Migrate one feature at a time (start with registration)
3. **Comprehensive Testing**: Add tests before refactoring, verify after
4. **Monitoring**: Add logging to track Server Action performance
5. **Rollback Plan**: Keep old code in separate branch until confidence is high

---

## Next Steps

1. **Review and Approve**: Share this plan with team, get feedback
2. **Spike**: Create proof-of-concept for registration flow only
3. **Validate**: Test POC in development environment
4. **Full Implementation**: Follow migration checklist
5. **QA**: Thorough testing in staging environment
6. **Deploy**: Gradual rollout to production with monitoring

---

## Questions to Answer Before Starting

1. **Do we have any external consumers of the `/api/register` or `/api/users` endpoints?**
   - If yes → Use Hybrid Approach
   - If no → Full Server Actions migration

2. **Is authentication/authorization required for backend API calls?**
   - If yes → Plan for JWT/session handling in Server Actions
   - If no → Current plan is sufficient

3. **Do we need real-time updates or subscriptions?**
   - If yes → Consider WebSocket or Server-Sent Events
   - If no → Server Actions are sufficient

4. **What is our deployment environment?**
   - Vercel/Netlify → Server Actions work seamlessly
   - Self-hosted/Docker → Ensure Node.js runtime support

5. **Do we have rate limiting or caching requirements?**
   - If yes → Plan for middleware or infrastructure layer enhancements
   - If no → Basic implementation is sufficient

---

## Additional Resources

- [Next.js Server Actions Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Domain-Driven Design in Next.js](https://khalilstemmler.com/articles/software-design-architecture/domain-driven-design-intro/)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Next.js App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)

---

## Conclusion

This refactoring eliminates duplicate code, reduces network hops, and simplifies your architecture by leveraging Next.js Server Actions. The migration can be done incrementally with low risk, and the benefits include better performance, maintainability, and developer experience.

**Recommended Timeline:**

- Week 1: Infrastructure setup + Server Actions for registration
- Week 2: Migrate remaining features + comprehensive testing
- Week 3: Clean up old code + documentation
- Week 4: QA + staging validation + production deployment

**Estimated Effort:** 2-3 weeks for full migration with thorough testing
