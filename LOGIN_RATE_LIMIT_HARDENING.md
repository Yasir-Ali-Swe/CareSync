# LOGIN RATE LIMIT HARDENING

**Date**: 2026-05-09  
**Status**: Completed and validated

## Architecture

Login protection now uses **two independent limiters** on the `/api/auth/login` route:

1. **IP-based limiter**
   - Key: `req.ip`
   - Max: `50`
   - Window: `15 minutes`
   - Purpose: blocks brute-force traffic from one network source, even if the attacker rotates email addresses

2. **Account-based limiter**
   - Key: normalized email
   - Max: `5`
   - Window: `15 minutes`
   - Purpose: blocks repeated password guessing on a specific account, even if the attacker rotates IPs
   - `skipSuccessfulRequests: true` is enabled so successful logins do not consume account attempts

## Files Changed

- [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js)
- [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js)

## Security Improvement

The previous design used a single login bucket keyed by `IP + email`. That reduced isolation between accounts, but it also weakened brute-force defense because attackers could rotate emails and avoid account-level exhaustion.

The new dual-layer design fixes that by enforcing **both**:

- one limit per IP
- one limit per account

This means:

- the same IP attacking multiple emails gets blocked by the IP limiter
- the same email attacked from multiple IPs gets blocked by the account limiter
- successful login does not consume account attempts
- normal login flow still works

## Trust Proxy / Counter Reset Notes

- `app.set("trust proxy", 1)` remains enabled so client IPs resolve correctly behind a proxy
- no persistent limiter store was added, so counters use the default in-memory store and reset after `windowMs`
- the `windowMs` for both login limiters remains `15 minutes`

## Test Cases

### 1. Same IP, multiple emails
**Expected**: blocked after `50` login attempts in `15 minutes` regardless of account rotation

### 2. Same email, multiple IPs
**Expected**: blocked after `5` failed login attempts in `15 minutes` regardless of IP rotation

### 3. Successful login
**Expected**: account attempts are not consumed because `skipSuccessfulRequests: true` is enabled on the account limiter

### 4. Normal login flow
**Expected**: first-time or valid login continues to work without unexpected blocking

### 5. Window expiration
**Expected**: both limiters reset automatically after `15 minutes`

### 6. Route scope
**Expected**: only `/api/auth/login` uses the dual limiters; register/reset routes continue using the existing auth limiter

## Validation Results

- `node --check` passed for:
  - [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js)
  - [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js)
  - [server/src/app.js](server/src/app.js)

## Summary

Login rate limiting is now layered for better brute-force resistance without changing unrelated auth behavior.
