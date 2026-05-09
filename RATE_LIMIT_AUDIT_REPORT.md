# RATE LIMIT AUDIT REPORT

**Date**: 2026-05-09  
**Scope**: Read-only forensic audit of backend rate limiting  
**Status**: Completed

## 1. Architecture Overview

The project uses one global application limiter and three auth-related limiters:

- a global app-wide limiter applied in [server/src/app.js](server/src/app.js#L20-L55)
- one auth limiter for register / forgot-password / reset-password in [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js#L21-L27)
- one IP-based login limiter in [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js#L29-L35)
- one account-based login limiter in [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js#L38-L44)

The architecture is layered, but login traffic is still exposed to overlapping throttles:

1. global app limiter
2. login IP limiter
3. login account limiter
4. controller-level validation and credential checks

That overlap is the main forensic finding.

---

## 2. Limiter Inventory

| Limiter | File | Purpose | Route usage | max | windowMs | Store | skipSuccessfulRequests | keyGenerator | handler |
|---|---|---:|---|---:|---:|---|---|---|---|
| globalRateLimit | [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js#L12-L17) | App-wide throttling | Applied globally via [app.use(globalRateLimit)](server/src/app.js#L48-L48) | 200 | 15 minutes | Default in-memory store | false | Default IP-based key | Default handler, custom message |
| authRateLimit | [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js#L20-L26) | Protect register / forgot-password / reset-password | [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js#L21-L27) | 25 | 15 minutes | Default in-memory store | true | Default IP-based key | Default handler, custom message |
| loginIpRateLimit | [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js#L29-L35) | Login brute-force protection by source IP | [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js#L22-L22) | 50 | 15 minutes | Default in-memory store | false | `req.ip` with socket/connection fallback | Default handler, custom message |
| loginAccountRateLimit | [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js#L38-L44) | Login brute-force protection by account | [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js#L22-L22) | 5 | 15 minutes | Default in-memory store | true | Normalized email, fallback `unknown-email` | Default handler, custom message |

### Notes on store type
No limiter in the repository specifies a custom `store`. There is also no Redis limiter package in [server/package.json](server/package.json#L12-L27). That means every limiter is using the library default in-memory store.

---

## 3. Route Middleware Chains

### 3.1 `/api/auth/login`

Execution order:

request
→ app-level middleware stack in [server/src/app.js](server/src/app.js#L20-L55)
→ globalRateLimit in [server/src/app.js](server/src/app.js#L48-L48)
→ auth router mount in [server/src/app.js](server/src/app.js#L54-L54)
→ loginIpRateLimit in [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js#L22-L22)
→ loginAccountRateLimit in [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js#L22-L22)
→ login controller in [server/src/controllers/auth.controller.js](server/src/controllers/auth.controller.js#L150-L199)

Important: there is no separate validation middleware before the controller. Validation happens inside the controller.

### 3.2 `/api/auth/register`

Execution order:

request
→ app-level middleware stack in [server/src/app.js](server/src/app.js#L20-L55)
→ globalRateLimit
→ auth router mount
→ authRateLimit in [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js#L21-L21)
→ register controller in [server/src/controllers/auth.controller.js](server/src/controllers/auth.controller.js#L68-L141)

### 3.3 `/api/auth/forgot-password`

Execution order:

request
→ app-level middleware stack
→ globalRateLimit
→ auth router mount
→ authRateLimit in [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js#L26-L26)
→ forgotPassword controller in [server/src/controllers/auth.controller.js](server/src/controllers/auth.controller.js#L348-L377)

### 3.4 `/api/auth/reset-password/:token`

Execution order:

request
→ app-level middleware stack
→ globalRateLimit
→ auth router mount
→ authRateLimit in [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js#L27-L27)
→ resetPassword controller in [server/src/controllers/auth.controller.js](server/src/controllers/auth.controller.js#L383-L487)

---

## 4. Collision Detection

### 4.1 Duplicated limiter application
No exact duplicate limiter instance is attached twice to the same route.

### 4.2 Nested limiter stacking
The login route stacks two distinct limiters:

- loginIpRateLimit
- loginAccountRateLimit

That is intentional, but it creates a blocking hierarchy where the IP limiter can preempt the account limiter.

### 4.3 Global overlap
The global limiter is applied with `app.use(globalRateLimit)` before route mounting in [server/src/app.js](server/src/app.js#L48-L54). That means every auth request also consumes the global app budget.

### 4.4 Auth limiter overlap
`authRateLimit` does not apply to `/api/auth/login` in the current code. It only applies to register / forgot-password / reset-password.

### 4.5 Route-specific overlap
Login is the only route with dual route-specific limiters. All other auth routes have a single route-specific limiter plus the global limiter.

---

## 5. Key Generation Audit

### 5.1 globalRateLimit
- No custom `keyGenerator`
- Default keying is IP-based
- Effective key: the resolved client IP

### 5.2 authRateLimit
- No custom `keyGenerator`
- Default keying is IP-based
- Effective key: the resolved client IP

### 5.3 loginIpRateLimit
Defined in [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js#L29-L35)

Key logic:

- primary source: `req.ip`
- fallback: `req.connection.remoteAddress`
- fallback: `req.socket.remoteAddress`
- fallback: `unknown-ip`
- IPv4-mapped IPv6 addresses are normalized by stripping `::ffff:`

Effective generated key examples:

- `192.168.1.20`
- `203.0.113.5`
- `unknown-ip` if IP resolution fails

### 5.4 loginAccountRateLimit
Defined in [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js#L38-L44)

Key logic:

- takes `req.body.email`
- trims whitespace
- lowercases the value
- falls back to `unknown-email`

Effective generated key examples:

- `user@example.com`
- `unknown-email`

### 5.5 Missing or malformed key cases
If email is missing or malformed, multiple requests collapse into the same `unknown-email` bucket. That is a broadening factor for account-level throttling.

### 5.6 Combined key
The current architecture does not use a combined `IP + email` login key.

---

## 6. Store Behavior Audit

### Store type
All rate limiters use the default in-memory store because no custom `store` is configured and no Redis store package is present in [server/package.json](server/package.json#L12-L27).

### Behavior
- counters are kept in process memory
- counters reset automatically after `windowMs`
- counters do not survive server restarts
- counters are not shared across multiple Node processes or pods

### Implications
- dev restart clears rate-limit history
- clustered or multi-instance deployments will have isolated limiter state per process unless a shared store is introduced
- the store itself is not persistent, so the reported lingering block is not explained by persistence in this codebase

---

## 7. Trust Proxy Analysis

`app.set("trust proxy", 1)` is present in [server/src/app.js](server/src/app.js#L20-L20).

### Interpretation
- correct if the app is behind exactly one trusted reverse proxy
- reasonable for common deployments such as a single ingress / load balancer
- direct localhost development still works because Express can resolve the socket address

### Risk
If deployment has more than one proxy hop and only one is trusted, `req.ip` can resolve to an upstream proxy IP instead of the real client. That would cause many users to share the same rate-limit bucket.

### Verdict
The trust proxy setting is plausible, but only correct under a single-proxy assumption.

---

## 8. Success / Failure Counting Audit

### Login controller response codes
From [server/src/controllers/auth.controller.js](server/src/controllers/auth.controller.js#L150-L199):

- `200` on successful login
- `401` on invalid credentials
- `403` on unverified email
- `403` on inactive account
- `400` on missing fields

### Register controller response codes
From [server/src/controllers/auth.controller.js](server/src/controllers/auth.controller.js#L68-L141):

- `400` on missing fields, invalid email, weak password, invalid role
- `409` if email already registered
- `201` on success

### Forgot password response codes
From [server/src/controllers/auth.controller.js](server/src/controllers/auth.controller.js#L348-L377):

- `400` on invalid email input
- `200` on success, even when the account does not exist

### Reset password response codes
From [server/src/controllers/auth.controller.js](server/src/controllers/auth.controller.js#L383-L487):

- `400` on missing token, missing password fields, mismatch, weak password, invalid token, expired token, token mismatch
- `404` if user not found
- `200` on success

### skipSuccessfulRequests behavior
- `loginAccountRateLimit` has `skipSuccessfulRequests: true`
- `authRateLimit` also has `skipSuccessfulRequests: true`
- `loginIpRateLimit` does not
- `globalRateLimit` does not

### Practical effect
A successful login still consumes the IP limiter budget, but not the account limiter budget.

---

## 9. Error-Path Audit

### Requests that count toward login limiting
Because the limiters are applied before controller logic, these all count toward the rate limit state:

- missing email or password
- invalid credentials
- unverified account
- inactive account
- malformed payloads
- controller-thrown errors that return non-2xx responses

### Special case: malformed email
For login, the account limiter key can become `unknown-email`. That means multiple malformed requests from different clients can collide on the same account bucket.

### Validation failures
Login validation is controller-based, not middleware-based. The request still reaches the controller only after both login limiters have already been evaluated.

---

## 10. Reproduction Audit

### Scenario A: same IP + same account
Expected outcome from current code:

- loginIpRateLimit increments on every request from that IP
- loginAccountRateLimit increments for that normalized email
- the account bucket blocks after 5 failed attempts
- the IP bucket blocks after 50 total attempts from the same IP

### Scenario B: same IP + different account
Expected outcome:

- account buckets remain separate per email
- IP bucket is shared
- many different accounts from one source IP still hit the same IP block

### Scenario C: different IP + same account
Expected outcome:

- IP buckets are separate
- the same normalized email shares the same account bucket
- the account bucket blocks after 5 failed attempts across IPs

### Scenario D: successful login after failed attempts
Expected outcome:

- loginAccountRateLimit does not count the success because `skipSuccessfulRequests: true`
- loginIpRateLimit still counts the successful request
- the account budget can recover, but the IP budget continues to accumulate

### Scenario E: window expiration
Expected outcome:

- counters clear after 15 minutes in the in-memory store
- because this is a fixed-window store, the effective reset point is based on the limiter window, not on a sliding last-request model

### Scenario F: different browser, same machine
Expected outcome:

- browser identity does not matter
- if the public IP is the same, the IP limiter is shared
- changing browser alone will not avoid the IP bucket

---

## 11. Root-Cause Candidates Ranked by Probability

### 1. loginIpRateLimit is the primary blocker
**Probability: very high**

Evidence:
- defined in [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js#L29-L35)
- stacked before the account limiter in [server/src/routes/auth.routes.js](server/src/routes/auth.routes.js#L22-L22)
- keyed only by IP
- does not skip successful requests

Why it matches the symptoms:
- same browser, different browser, and different account all still hit the same IP bucket when the public IP does not change
- changing email does not help because the IP bucket is independent of account identity

### 2. Global limiter overlap broadens the incident surface
**Probability: medium**

Evidence:
- `app.use(globalRateLimit)` in [server/src/app.js](server/src/app.js#L48-L48)
- it applies before all routes, including auth

Why it matters:
- it adds a second independent throttle on top of login-specific throttles
- it can make the overall system feel broader than intended

### 3. Trust proxy assumptions may collapse multiple clients into one IP
**Probability: medium**

Evidence:
- `app.set("trust proxy", 1)` in [server/src/app.js](server/src/app.js#L20-L20)
- login IP key resolves via `req.ip` in [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js#L4-L10)

Why it matters:
- if deployment topology has more than one proxy hop, many users may appear under a single source IP

### 4. account key fallback to `unknown-email`
**Probability: low to medium**

Evidence:
- `getLoginEmailKey` falls back to `unknown-email` in [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js#L8-L10)

Why it matters:
- malformed or missing email payloads collide into one account bucket

### 5. Fixed-window in-memory store can appear to linger
**Probability: low**

Evidence:
- no custom store is configured anywhere
- default in-memory store is used

Why it matters:
- users often expect a sliding window from the last attempt, but this implementation resets based on the limiter window
- this explains the "longer than expected" perception better than persistence

---

## 12. Security Weaknesses

1. IP-only login throttling is too coarse for NAT, offices, shared Wi-Fi, and mobile carrier networks.
2. Account limiter collision on `unknown-email` can punish malformed traffic broadly.
3. Global limiter is layered on top of auth throttles and broadens the effect surface.
4. In-memory store is not shared across instances, so rate limiting is not horizontally consistent.
5. Successful login still consumes the IP budget, which can block legitimate users after repeated normal sign-ins.

---

## 13. Recommended Fixes

These are recommendations only. No code has been changed in this audit.

### Preferred direction
Use a dedicated login protection strategy that combines:
- a shared store if the app runs behind multiple instances
- a single route-specific policy for login
- careful handling of IP and account signals

### Specific recommendations
- keep login IP throttling, but treat it as one signal, not the only source of truth
- avoid overly broad global throttling for auth flows
- remove or reconsider any fallback key that collapses unknown data into one hot bucket
- verify proxy topology and trust-proxy depth against deployment architecture

### Patch vs redesign
- **Patch** is sufficient if the only issue is the login IP limiter being too aggressive
- **Redesign** is better if this app is deployed behind proxies, load balancers, or multiple Node workers, because the current architecture is fragile under those conditions

---

## 14. Final Verdict

### Architecture verdict
**Flawed** for production-grade login abuse handling.

### Most likely root cause
The primary root cause is in [server/src/middlewares/rateLimit.middleware.js](server/src/middlewares/rateLimit.middleware.js#L29-L44), with broadening overlap from [server/src/app.js](server/src/app.js#L48-L55).

### Why
- login is gated by an IP-only limiter before the account limiter
- the global limiter also applies to auth requests
- the store is in-memory and fixed-window
- trust proxy correctness depends on deployment topology

### Better remediation path
**Redesign is preferable** if you want stable production semantics across browsers, accounts, and proxy layers. A simple patch can reduce symptoms, but it will not remove the architectural fragility.
