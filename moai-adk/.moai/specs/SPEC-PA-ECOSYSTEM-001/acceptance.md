# Acceptance Criteria: Puerto Aventuras Super-App

> **TAG-ACC-PA-ECOSYSTEM-001**
>
> Acceptance criteria and test scenarios for the Puerto Aventuras integrated digital ecosystem

---

## TAG BLOCK

```yaml
acceptance_id: TAG-ACC-PA-ECOSYSTEM-001
spec_id: SPEC-PA-ECOSYSTEM-001
plan_id: TAG-PLAN-PA-ECOSYSTEM-001
title: Puerto Aventuras Super-App Acceptance Criteria
status: Planned
created: 2026-02-21
version: 1.0.0
traceability:
  spec: TAG-SPEC-PA-ECOSYSTEM-001
  plan: TAG-PLAN-PA-ECOSYSTEM-001
```

---

## Test Format Legend

All test scenarios follow the Given-When-Then (Gherkin) format:

- **GIVEN:** Precondition or initial state
- **WHEN:** Action or event occurs
- **THEN:** Expected outcome or result
- **AND:** Additional conditions or outcomes

---

## Quality Gates (TRUST 5)

### Tested Pillar

- [ ] 85%+ code coverage achieved
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Characterization tests for legacy code
- [ ] Property-based tests for critical algorithms

### Readable Pillar

- [ ] Code follows naming conventions
- [ ] Linter errors: 0
- [ ] Linter warnings: < 10
- [ ] Code reviewed by senior developer
- [ ] Comments in English for technical documentation

### Unified Pillar

- [ ] Code formatted consistently (Prettier)
- [ ] Imports organized (isort/ESLint)
- [ ] No unused dependencies
- [ ] TypeScript noImplicitAny enabled
- [ ] ESLint rules configured and enforced

### Secured Pillar

- [ ] OWASP Top 10 vulnerabilities addressed
- [ ] No hardcoded credentials
- [ ] All PII encrypted at rest and in transit
- [ ] Security scan passed (Snyk/SonarQube)
- [ ] Penetration testing completed

### Trackable Pillar

- [ ] Commit messages follow Conventional Commits
- [ ] All commits linked to requirement tags
- [ ] PR descriptions include acceptance criteria
- [ ] Changelog updated
- [ ] Release notes generated

---

## Foundation Acceptance Criteria

### TAG-ACC-F-001: User Registration

**Requirement:** REQ-F-101, REQ-F-102

**Scenario 1.1: Successful User Registration**
```
GIVEN a new user with valid email and phone number
WHEN they submit registration form with password
THEN a pending account is created
AND verification email is sent
AND verification SMS is sent
AND account status is "pending verification"
```

**Scenario 1.2: Email Verification**
```
GIVEN a user with pending account status
WHEN they click verification link from email
THEN account status changes to "active"
AND welcome notification is sent
AND user can now login
```

**Scenario 1.3: Duplicate Email Registration**
```
GIVEN an existing user with email "user@example.com"
WHEN a new user attempts to register with same email
THEN registration is rejected
AND error message indicates email already exists
```

**Scenario 1.4: Invalid Email Format**
```
GIVEN a registration form
WHEN user enters invalid email format
THEN form validation shows error
AND submission is blocked
```

### TAG-ACC-F-002: User Authentication

**Requirement:** REQ-F-103

**Scenario 2.1: Successful Login**
```
GIVEN a registered user with valid credentials
WHEN they submit login form
THEN access token (15 min) is returned
AND refresh token (7 days) is returned
AND user is redirected to dashboard
```

**Scenario 2.2: Failed Login - Wrong Password**
```
GIVEN a registered user
WHEN they submit login with wrong password
THEN authentication fails
AND failed attempt counter increments
AND error message is generic (no user existence revealed)
```

**Scenario 2.3: Account Lockout**
```
GIVEN a user with 4 failed login attempts in 10 minutes
WHEN they attempt 5th login with wrong password
THEN account is locked for 30 minutes
AND email notification is sent about lockout
```

**Scenario 2.4: Token Refresh**
```
GIVEN a user with expired access token
WHEN they request new token with valid refresh token
THEN new access token is issued
AND refresh token rotation occurs
AND user session continues
```

### TAG-ACC-F-003: Data Encryption

**Requirement:** REQ-F-001, REQ-P-001

**Scenario 3.1: PII Encryption at Rest**
```
GIVEN a database with user personal information
WHEN querying user records directly
THEN sensitive fields (email, phone, name) are encrypted
AND plaintext is not visible in database
```

**Scenario 3.2: Data Encryption in Transit**
```
GIVEN a client application
WHEN making API requests
THEN all traffic uses TLS 1.3
AND sensitive data is never sent over HTTP
```

**Scenario 3.3: Wallet Data Encryption**
```
GIVEN a user wallet with balance
WHEN wallet data is stored
THEN balance and transaction history are AES-256 encrypted
AND decryption requires proper authentication
```

### TAG-ACC-F-004: LFPDPPP Compliance

**Requirement:** REQ-C-001 through REQ-C-303

**Scenario 4.1: Explicit Consent Collection**
```
GIVEN a new user registration form
WHEN user submits registration
THEN explicit consent for data processing is obtained
AND consent is recorded with timestamp
AND privacy policy is accessible
```

**Scenario 4.2: ARCO - Data Access**
```
GIVEN a registered user
WHEN they request access to their personal data
THEN complete data export is provided within 15 days
AND export includes all PII stored
AND data is in machine-readable format
```

**Scenario 4.3: ARCO - Data Deletion**
```
GIVEN a registered user
WHEN they request account deletion
THEN deletion request is processed within 15 days
AND all personal data is anonymized or deleted
AND confirmation is sent to user
```

**Scenario 4.4: ARCO - Data Rectification**
```
GIVEN a user with incorrect address
WHEN they request address correction
THEN data is updated within 10 days
AND correction is confirmed via email
AND audit trail records the change
```

**Scenario 4.5: Consent Withdrawal**
```
GIVEN a user who previously consented to marketing
WHEN they withdraw marketing consent
THEN marketing communications cease immediately
AND consent record is updated
AND data retention period is adjusted
```

---

## Security Module Acceptance Criteria

### TAG-ACC-S-001: QR Code Generation

**Requirement:** REQ-S-101, REQ-S-102

**Scenario 1.1: Resident Generates Visitor QR**
```
GIVEN a logged-in resident user
WHEN they generate a visitor QR code for tomorrow
THEN a unique QR code is created
AND code contains encrypted payload
AND code has expiration time
AND code is single-use only
```

**Scenario 1.2: QR Code Validation**
```
GIVEN a visitor with valid QR code
WHEN they scan QR at security gate
THEN system validates code within 2 seconds
AND access is granted if valid
AND gate opens automatically
AND access is logged
```

**Scenario 1.3: Expired QR Code**
```
GIVEN a visitor with expired QR code
WHEN they scan QR at security gate
THEN system rejects code
AND "Expired" message is displayed
AND security personnel are notified
AND gate remains closed
```

**Scenario 1.4: Reused QR Code**
```
GIVEN a visitor who already used their QR code
WHEN they attempt to scan same QR again
THEN system rejects code
AND "Already used" message is displayed
AND access attempt is logged for security review
```

### TAG-ACC-S-002: License Plate Recognition

**Requirement:** REQ-S-104

**Scenario 2.1: Authorized Vehicle Access**
```
GIVEN a vehicle registered to resident with plate "ABC-123"
WHEN LPR system detects plate "ABC-123"
THEN system validates plate against database
AND gate opens automatically
AND access is logged with timestamp
```

**Scenario 2.2: Unauthorized Vehicle**
```
GIVEN a vehicle not registered in system with plate "XYZ-999"
WHEN LPR system detects plate "XYZ-999"
THEN system denies access
AND security personnel receive alert
AND vehicle image is captured
```

**Scenario 2.3: Unrecognized Plate**
```
GIVEN a vehicle with plate not in LPR database
WHEN LPR system cannot read plate confidently
THEN system requests manual verification
AND security officer is prompted to approve
AND manual approval is logged
```

### TAG-ACC-S-003: Visitor Management

**Requirement:** REQ-S-105, REQ-S-106

**Scenario 3.1: Pre-registered Visitor Arrival**
```
GIVEN a visitor pre-registered by resident
WHEN visitor arrives and provides identification
THEN security staff can verify pre-registration
AND visitor badge is issued
AND resident is notified of arrival
```

**Scenario 3.2: Walk-in Visitor**
```
GIVEN a visitor without pre-registration
WHEN they arrive at security gate
THEN system prompts for resident notification
WHEN resident approves via app
THEN visitor QR code is generated
AND access is granted
```

**Scenario 3.3: Provider Check-in**
```
GIVEN a registered provider with scheduled appointment
WHEN they arrive for appointment
THEN system verifies appointment details
AND access credentials are issued
AND resident is notified of provider arrival
AND checkout reminder is scheduled
```

---

## Marina Module Acceptance Criteria

### TAG-ACC-M-001: Slip Reservation

**Requirement:** REQ-M-101, REQ-M-102

**Scenario 1.1: View Available Slips**
```
GIVEN a boat owner with 40ft boat
WHEN they search for available slips for next weekend
THEN only slips accommodating 40ft+ boats are shown
AND real-time availability is displayed
AND pricing is calculated based on boat length
```

**Scenario 1.2: Successful Reservation**
```
GIVEN a boat owner viewing available slips
WHEN they book Slip 42 for 3 days
THEN reservation is confirmed
AND slip is blocked for those dates
AND deposit is charged to wallet
AND confirmation email is sent
```

**Scenario 1.3: Double-Booking Prevention**
```
GIVEN Slip 15 already booked for July 1-3
WHEN another user attempts to book same dates
THEN system shows slip as unavailable
AND booking is prevented
AND alternative slips are suggested
```

**Scenario 1.4: Boat Size Validation**
```
GIVEN a boat owner with 120ft boat
WHEN they attempt to book slip with max 100ft capacity
THEN system rejects booking
AND error message indicates boat too large
AND suitable slips are suggested
```

### TAG-ACC-M-002: Check-in/Check-out

**Requirement:** REQ-M-103, REQ-M-104

**Scenario 2.1: Marina Check-in**
```
GIVEN a boat with confirmed reservation at Slip 42
WHEN boat arrives and owner checks in via app
THEN slip assignment is confirmed
AND marina staff is notified
AND services (water, electricity) are activated
AND check-in timestamp is recorded
```

**Scenario 2.2: Marina Check-out**
```
GIVEN a boat currently docked at Slip 42
WHEN owner checks out via app
THEN final charges are calculated
AND payment is processed
AND slip is released for future bookings
AND marina staff is notified
```

**Scenario 2.3: Overtime Calculation**
```
GIVEN a boat that stays 2 hours beyond checkout time
WHEN check-out is processed
THEN overtime fees are calculated
AND additional charges are displayed
AND payment confirmation is required
```

### TAG-ACC-M-003: Service Requests

**Requirement:** REQ-M-105

**Scenario 3.1: Request Pump-out Service**
```
GIVEN a boat docked at Slip 25
WHEN owner requests pump-out service via app
THEN request is sent to marina staff
AND owner receives confirmation
AND staff can track pending requests
AND service completion is logged
```

---

## Golf & Sports Module Acceptance Criteria

### TAG-ACC-G-001: Tee Time Booking

**Requirement:** REQ-G-101, REQ-G-102

**Scenario 1.1: View Available Tee Times**
```
GIVEN a registered user
WHEN they search for tee times tomorrow morning
THEN available slots are displayed in 10-minute intervals
AND pricing is shown per player
AND course availability is real-time
```

**Scenario 1.2: Book Tee Time**
```
GIVEN a user viewing available tee times
WHEN they book 8:00 AM tee time for 4 players
THEN reservation is confirmed
AND fee is charged to wallet
AND confirmation is sent
AND tee time is no longer available to others
```

**Scenario 1.3: Member vs Guest Pricing**
```
GIVEN a user with unpaid membership status
WHEN they attempt to book a tee time
THEN guest fee is applied
AND option to pay membership dues is presented
AND total is calculated accordingly
```

**Scenario 1.4: Cancellation Policy**
```
GIVEN a user with tee time booked tomorrow
WHEN they cancel less than 24 hours before
THEN cancellation fee is applied
AND partial refund is processed
AND user is notified of fee
```

### TAG-ACC-G-002: Sports Court Reservation

**Requirement:** REQ-G-104, REQ-G-106

**Scenario 2.1: Reserve Tennis Court**
```
GIVEN a registered user
WHEN they reserve Tennis Court 3 for 2 hours
THEN time slot is blocked
AND court access code is provided
AND confirmation is sent
```

**Scenario 2.2: Automatic Lighting Activation**
```
GIVEN a tennis court reservation starting at 6:00 PM
WHEN sunset time is 5:45 PM
THEN court lighting activates automatically at 6:00 PM
AND lighting stays on for reservation duration + 15 min buffer
AND lighting deactivates after reservation ends
```

**Scenario 2.3: Smart Lock Unlock**
```
GIVEN a user with court reservation
WHEN they arrive at court and verify via app
THEN court smart lock is unlocked
AND access timestamp is logged
AND lock auto-locks after reservation ends
```

### TAG-ACC-G-003: Class Registration

**Requirement:** REQ-G-103

**Scenario 3.1: Register for Golf Class**
```
GIVEN a scheduled beginner golf class with 5 spots
WHEN user registers for class
THEN they are added to class roster
AND spot availability decreases
AND instructor is notified
AND calendar invitation is sent
```

**Scenario 3.2: Class Full**
```
GIVEN a class with 0 available spots
WHEN user attempts to register
THEN system shows class as full
AND waitlist option is offered
```

---

## Marketplace Module Acceptance Criteria

### TAG-ACC-MK-001: Restaurant Ordering

**Requirement:** REQ-MK-101 through REQ-MK-103

**Scenario 1.1: Browse Restaurants**
```
GIVEN a user at residential address
WHEN they browse restaurants
THEN only open restaurants are shown
AND delivery fee is calculated based on distance
AND estimated delivery time is displayed
```

**Scenario 1.2: Place Order**
```
GIVEN a user with items in cart from Restaurant A
WHEN they place order
THEN order is confirmed
AND restaurant receives notification
AND payment is processed via PA Pay
AND order confirmation is sent to user
```

**Scenario 1.3: Order Status Tracking**
```
GIVEN a user with pending order
WHEN order status changes
THEN user receives real-time updates
AND status shows: confirmed → preparing → ready → delivering → completed
AND delivery tracking shows driver location
```

**Scenario 1.4: Restaurant Closed**
```
GIVEN a restaurant that is closed
WHEN user attempts to place order
THEN system shows restaurant as closed
AND next opening time is displayed
AND ordering is disabled
```

### TAG-ACC-MK-002: Delivery Tracking

**Requirement:** REQ-MK-104

**Scenario 2.1: Driver Assignment**
```
GIVEN an order ready for delivery
WHEN driver accepts delivery
THEN user receives notification with driver info
AND live tracking becomes available
AND estimated arrival time is calculated
```

**Scenario 2.2: Delivery Completion**
```
GIVEN a driver arriving at delivery location
WHEN delivery is completed
THEN user is prompted to confirm
AND user can rate driver and restaurant
AND loyalty points are credited
```

### TAG-ACC-MK-003: Restaurant Reservation

**Requirement:** REQ-MK-106

**Scenario 3.1: Make Reservation**
```
GIVEN a user wanting to dine at Restaurant X
WHEN they make reservation for 4 people at 7 PM
THEN availability is checked
AND reservation is confirmed
AND confirmation is sent
AND restaurant is notified
```

---

## Digital Wallet Acceptance Criteria

### TAG-ACC-P-001: Wallet Creation

**Requirement:** REQ-P-101

**Scenario 1.1: Create Wallet on Registration**
```
GIVEN a new user completing registration
WHEN registration is successful
THEN a PA Pay wallet is automatically created
AND wallet has zero balance
AND unique wallet ID is generated
```

### TAG-ACC-P-002: Add Funds

**Requirement:** REQ-P-102

**Scenario 2.1: Add Funds via Credit Card**
```
GIVEN a user with PA Pay wallet
WHEN they add 1000 MXN via credit card
THEN payment is processed securely
AND wallet balance increases by 1000 MXN
AND transaction is recorded
AND receipt is sent
```

**Scenario 2.2: Insufficient External Payment**
```
GIVEN a user attempting to add funds
WHEN external payment fails
THEN wallet balance remains unchanged
AND error message is displayed
AND no transaction is recorded
```

### TAG-ACC-P-003: Make Payment

**Requirement:** REQ-P-103, REQ-P-104

**Scenario 3.1: Pay for Marina Service**
```
GIVEN a user with 5000 MXN wallet balance
WHEN they pay 2000 MXN for marina reservation
THEN balance is reduced to 3000 MXN
AND payment is confirmed
AND transaction is recorded
AND loyalty points are credited
```

**Scenario 3.2: Insufficient Balance**
```
GIVEN a user with 500 MXN wallet balance
WHEN they attempt to pay 1000 MXN
THEN payment is declined
AND "Insufficient balance" message is shown
AND add funds option is presented
```

**Scenario 3.3: Daily Limit Exceeded**
```
GIVEN a user who has spent 15,000 MXN today (limit: 10,000 MXN)
WHEN they attempt 5000 MXN payment
THEN additional verification is required
AND OTP is sent to registered phone
AND payment proceeds after OTP verification
```

### TAG-ACC-P-004: Loyalty Points

**Requirement:** REQ-P-105

**Scenario 4.1: Earn Loyalty Points**
```
GIVEN a user making a 1000 MXN purchase
WHEN payment is completed
THEN 10 points are credited (1 point per 100 MXN)
AND points balance is updated
AND user is notified
```

**Scenario 4.2: Redeem Loyalty Points**
```
GIVEN a user with 5000 loyalty points
WHEN they redeem points for discount
THEN discount is applied to transaction
AND points are deducted
AND redemption is recorded
```

**Scenario 4.3: Points Expiring Soon**
```
GIVEN a user with points expiring in 30 days
WHEN expiration threshold is reached
THEN user receives notification
AND redemption options are presented
AND expiry date is clearly displayed
```

---

## Performance Acceptance Criteria

### TAG-ACC-PERF-001: Response Times

| Metric | Target | Measurement |
|--------|--------|-------------|
| API P50 latency | < 200ms | Percentile measurement |
| API P95 latency | < 500ms | Percentile measurement |
| API P99 latency | < 1000ms | Percentile measurement |
| QR validation | < 2 seconds | End-to-end timing |
| Page load (FCP) | < 1.5s | Core Web Vitals |
| Page load (LCP) | < 2.5s | Core Web Vitals |

### TAG-ACC-PERF-002: Scalability

**Scenario 2.1: Concurrent Users**
```
GIVEN system under normal load
WHEN 5,000 concurrent users are active
THEN all APIs respond within SLA
AND no errors occur
AND system remains stable
```

**Scenario 2.2: Peak Load**
```
GIVEN system during holiday weekend
WHEN 20,000 concurrent users are active
THEN all critical functions remain operational
AND graceful degradation occurs for non-critical features
AND system recovers automatically when load decreases
```

### TAG-ACC-PERF-003: Availability

**Scenario 3.1: Uptime Target**
```
GIVEN system monitoring for one month
WHEN uptime is calculated
THEN uptime is >= 99.9% (43.2 minutes downtime max/month)
AND unplanned outages are < 10 minutes
AND maintenance windows are scheduled in advance
```

---

## Security Acceptance Criteria

### TAG-ACC-SEC-001: Authentication Security

**Scenario 1.1: Password Requirements**
```
GIVEN a user creating account
WHEN they enter password that doesn't meet requirements
THEN password is rejected
AND requirements are displayed (min 8 chars, uppercase, number, special)
AND user cannot proceed with weak password
```

**Scenario 1.2: Session Timeout**
```
GIVEN a user logged into app
WHEN they are inactive for 15 minutes
THEN session expires
AND user is redirected to login
AND secure data is cleared from memory
```

**Scenario 1.3: Concurrent Session Limit**
```
GIVEN a user logged in on device A
WHEN they log in on device B
THEN session on device A is terminated
OR user is prompted to choose active session
```

### TAG-ACC-SEC-002: Authorization

**Scenario 2.1: Resident Cannot Access Admin Functions**
```
GIVEN a user with "resident" role
WHEN they attempt to access admin panel
THEN access is denied
AND 403 error is returned
AND unauthorized access attempt is logged
```

**Scenario 2.2: Cross-User Data Access Prevention**
```
GIVEN user A logged into app
WHEN they attempt to access user B's data
THEN access is denied
AND error is logged
AND user A is notified of security violation
```

### TAG-ACC-SEC-003: Input Validation

**Scenario 3.1: SQL Injection Prevention**
```
GIVEN any API endpoint accepting user input
WHEN input contains SQL injection attempt
THEN input is sanitized
AND query fails safely
AND attack attempt is logged
```

**Scenario 3.2: XSS Prevention**
```
GIVEN a user input field for profile name
WHEN input contains <script> tags
THEN input is sanitized
AND script is not rendered
AND raw input is stored safely
```

---

## Integration Acceptance Criteria

### TAG-ACC-INT-001: IoT Lighting Control

**Scenario 1.1: Automatic Lighting Activation**
```
GIVEN a tennis court with reservation starting soon
WHEN sunset time approaches
THEN MQTT message is sent to lighting controller
AND court lights activate
AND confirmation is received
AND status is logged
```

**Scenario 1.2: IoT Communication Failure**
```
GIVEN lighting controller offline
WHEN activation command is sent
THEN failure is detected
AND fallback manual notification is sent
AND maintenance ticket is created
AND user is informed of manual process
```

### TAG-ACC-INT-002: LPR Integration

**Scenario 2.1: LPR Data Processing**
```
GIVEN LPR system detecting license plate
WHEN data is sent to API
THEN plate is validated against database
AND authorization decision is returned
AND gate command is sent
AND event is logged
```

---

## Definition of Done

A feature is **Done** when:

**Functional:**
- [ ] All acceptance criteria pass
- [ ] All test scenarios execute successfully
- [ ] No critical or high-priority bugs

**Quality:**
- [ ] Code coverage >= 85%
- [ ] No linter errors
- [ ] Linter warnings < 10
- [ ] Code review approved

**Security:**
- [ ] No critical security vulnerabilities
- [ ] PII encryption verified
- [ ] OWASP Top 10 addressed

**Performance:**
- [ ] Response times meet SLA
- [ ] Load testing passed
- [ ] No memory leaks

**Documentation:**
- [ ] API documentation updated
- [ ] User documentation updated
- [ ] Changelog updated

**Deployment:**
- [ ] Deployed to staging
- [ ] Smoke tests passed
- [ ] Stakeholder approved

---

## Test Execution Strategy

### Unit Tests
- **Scope:** Individual functions and methods
- **Coverage Target:** 85%
- **Tools:** Jest, Vitest

### Integration Tests
- **Scope:** API endpoints and database interactions
- **Coverage:** All critical paths
- **Tools:** Supertest, Playwright

### End-to-End Tests
- **Scope:** Complete user workflows
- **Coverage:** Happy path + edge cases
- **Tools:** Playwright, Cypress

### Security Tests
- **Scope:** Authentication, authorization, input validation
- **Tools:** OWASP ZAP, Snyk

### Performance Tests
- **Scope:** Load testing, stress testing
- **Tools:** k6, Artillery

---

## Traceability Matrix

| Acceptance Criteria | Requirement | Test Case | Status |
|---------------------|-------------|-----------|--------|
| TAG-ACC-F-001 | REQ-F-101, REQ-F-102 | TC-F-001 to TC-F-004 | Pending |
| TAG-ACC-F-002 | REQ-F-103 | TC-F-005 to TC-F-008 | Pending |
| TAG-ACC-S-001 | REQ-S-101, REQ-S-102 | TC-S-001 to TC-S-004 | Pending |
| TAG-ACC-M-001 | REQ-M-101, REQ-M-102 | TC-M-001 to TC-M-004 | Pending |
| TAG-ACC-G-001 | REQ-G-101, REQ-G-102 | TC-G-001 to TC-G-004 | Pending |
| TAG-ACC-MK-001 | REQ-MK-101 to REQ-MK-103 | TC-MK-001 to TC-MK-004 | Pending |
| TAG-ACC-P-001 | REQ-P-101 | TC-P-001 | Pending |

---

**Traceability:**
- **TAG-SPEC-PA-ECOSYSTEM-001:** Requirements specification
- **TAG-PLAN-PA-ECOSYSTEM-001:** Implementation plan
