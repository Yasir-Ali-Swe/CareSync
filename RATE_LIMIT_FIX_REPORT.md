# RATE LIMIT FIX REPORT

**Date**: 2026-05-09  
**Scope**: Login rate limiter audit and fix  
**Status**: Fixed and validated

## Root Cause

The login limiter was effectively **IP-only** and shared across auth flows. That caused:

- the same bucket to be reused across different browsers on the same network
- different accounts on the same IP to be blocked together
- successful login attempts to continue counting toward the limit
- client IPs behind a proxy to be resolved incorrectly without trusted proxy configuration

## Files Changed

- [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js)
- [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js)
- [server/src/app.js](server/src/app.js)

## Exact Fix

### 1. Added a login-specific rate limiter
A new `loginRateLimit` was added for the login route only.

### 2. Made the limiter account-aware
The limiter key is now built from:

- client IP
- normalized login email

This isolates attempts by account while still keeping IP-based protection.

### 3. Enabled successful-request skipping
`skipSuccessfulRequests: true` ensures successful logins do not consume attempts.

### 4. Enabled trusted proxy handling
`app.set("trust proxy", 1)` was added so `req.ip` resolves correctly when the server is behind a proxy.

### 5. Kept non-login auth routes separate
`/register`, `/forgot-password`, and `/reset-password` still use the auth limiter, but `/login` now uses the dedicated login limiter.

## Why This Fix Works

- **Different accounts**: isolated because the key includes email
- **Different IPs**: isolated because the key includes IP and trusted proxy resolution is enabled
- **Successful login**: does not increment the limiter because successful requests are skipped
- **Window expiration**: still 15 minutes, with the default in-memory store, so counters expire automatically after `windowMs`

## Validation Results

### Syntax validation
Ran:
- `node --check src/app.js`
- `node --check src/routes/auth.routes.js`
- `node --check src/middlewares/rateLimit.middleware.js`

Result: **Passed**

### Code-level verification
Confirmed:
- `windowMs` remains 15 minutes
- `max` remains 25 attempts
- `keyGenerator` is now explicit and account-aware
- no persistent store is configured, so the limiter uses the default in-memory store
- `skipSuccessfulRequests` is enabled
- login limiter is applied only on `/api/auth/login`

## Notes

No unrelated files were refactored.
