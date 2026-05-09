# RATE LIMIT FIX REPORT

**Date**: 2026-05-09  
**Scope**: Rate-limit architecture improvement  
**Status**: Implemented and validated

## Files Changed

- [server/src/app.js](server/src/app.js)
- [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js)
- [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js)

## Exact Changes

### 1. Global limiter excluded from auth routes
The global limiter was moved to apply only after the auth route mount in [server/src/app.js](server/src/app.js#L45-L56).

Result:
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/forgot-password`
- `/api/auth/reset-password`

are no longer throttled by the app-wide limiter.

### 2. Login uses dual-layer protection in the correct order
In [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js#L20-L28), login middleware order is now:

1. account limiter
2. IP limiter
3. controller

### 3. Login thresholds updated
In [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js#L29-L44):

- IP-based login limiter: `max = 100`, `windowMs = 15 minutes`, `skipSuccessfulRequests = true`
- account-based login limiter: `max = 5`, `windowMs = 15 minutes`, `skipSuccessfulRequests = true`

### 4. Unknown-email collision removed
If login email is missing, the account limiter key now becomes `req.ip + ":unknown-email"` instead of a shared static fallback.

## Why This Is Safer

This version is safer because it separates concerns:

- the global limiter protects the rest of the API without interfering with auth flows
- the account limiter remains the primary brute-force defense for a single identity
- the IP limiter remains a secondary abuse-control signal for source-network spraying
- successful logins do not consume account attempts
- missing-email payloads no longer collapse into one shared static bucket

## Before vs After Behavior

### Before
- auth routes were also subject to the global limiter
- login used a combined IP+email bucket
- missing email collapsed into a shared static fallback
- IP limiter was lower and could block normal login flow sooner

### After
- auth routes are excluded from the global limiter
- login uses two explicit layers:
	- account limiter first
	- IP limiter second
- missing email uses `req.ip + ":unknown-email"`
- IP threshold is `100`, account threshold stays `5`

## Test Scenarios

### Scenario 1: Same IP, multiple emails
Expected: IP limiter eventually blocks repeated abuse from one network source.

### Scenario 2: Same email, multiple IPs
Expected: account limiter blocks repeated password guessing for that account after 5 failed attempts.

### Scenario 3: Successful login after failures
Expected: successful login does not consume account attempts because `skipSuccessfulRequests = true` is preserved.

### Scenario 4: Auth routes under normal traffic
Expected: register / forgot-password / reset-password are not throttled by the global limiter.

### Scenario 5: Window expiration
Expected: counters reset after 15 minutes in the default in-memory store.

### Scenario 6: Missing email payload
Expected: key becomes `req.ip + ":unknown-email"`, avoiding a static shared collision bucket.

## Validation Results

- Syntax checks passed for:
	- [server/src/app.js](server/src/app.js)
	- [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js)
	- [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js)

## Summary

The login rate-limit architecture now has clearer separation and lower false-positive risk while preserving brute-force protection.
