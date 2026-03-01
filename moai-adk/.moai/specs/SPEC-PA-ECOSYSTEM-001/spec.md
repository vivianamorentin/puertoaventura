# SPEC-PA-ECOSYSTEM-001: Puerto Aventuras Super-App

> **Puerto Aventuras Integrated Digital Ecosystem** - Comprehensive Lifestyle & Commerce Platform
>
> Luxury residential community Super-App with integrated security, marina, golf, marketplace, and digital wallet services.

---

## TAG BLOCK

```yaml
spec_id: SPEC-PA-ECOSYSTEM-001
title: Puerto Aventuras Super-App Ecosystem
status: Planned
priority: High
created: 2026-02-21
version: 1.0.0
domains:
  - security
  - marina
  - golf_sports
  - marketplace
  - payments
tech_stack:
  frontend: Next.js 16 + React 19
  backend: Node.js
  database: PostgreSQL
  iot: MQTT/REST
regulatory:
  - LFPDPPP
  - AES-256
  - ARCO
traceability:
  plan: TAG-PLAN-PA-ECOSYSTEM-001
  acceptance: TAG-ACC-PA-ECOSYSTEM-001
```

---

## Environment

### Geographic Context

**Location:** Puerto Aventuras, Solidaridad, Quintana Roo, Mexico
**Population:** 20,000+ residents
**Regional Context:** 1,857,985 (Quintana Roo state)

### Business Context

**Current State:** Generic "Residentia" app with limited functionality
**Target State:** Comprehensive Super-App integrating all community services

**Key Metrics:**
- STR Revenue: Top 10% earn US$6,840+/month, median US$1,607
- Tourist Spend: US$1,178.70 average per visitor
- Marina Assets: 143 slips (up to 150ft boats)
- Foreign Investment: US$751B accumulated

### Regulatory Environment

**LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de Particulares):**
- Mexican data protection law requiring explicit consent
- ARCO rights (Acceso, Rectificación, Cancelación, Oposición)
- Data breach notification within 72 hours
- Privacy by design and by default

**Security Requirements:**
- AES-256 encryption for sensitive data
- Cloud computing security compliance
- OWASP Top 10 mitigation
- Regular security audits

### Technical Environment

**Tech Stack:**
- Frontend: Next.js 16 with React 19
- Backend: Node.js with Express/Fastify
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT with refresh tokens
- Real-time: WebSocket/Server-Sent Events
- IoT Integration: MQTT protocol
- Deployment: Cloud infrastructure (AWS/Azure)

**Infrastructure Requirements:**
- High availability (99.9% uptime SLA)
- Scalability for 20,000+ concurrent users
- Low latency (< 200ms for API responses)
- Disaster recovery and backup

---

## Assumptions

### Assumption Audit (Philosopher Framework)

| Assumption | Confidence | Evidence | Risk if Wrong | Validation |
|------------|------------|----------|---------------|------------|
| Users have smartphones with internet | High | 95%+ smartphone penetration in region | Low - can provide kiosks | Survey of residents |
| Existing LPR infrastructure is compatible | Medium | Industry standard protocols | Medium - may need adapters | Technical audit |
| Restaurant partners have online capability | Medium | Mixed technology adoption | High - manual fallback needed | Partner outreach |
| Marina slips database is accurate | Medium | Current manual tracking | Medium - data migration issues | Data reconciliation |
| WiFi coverage is adequate in all areas | Medium | Infrastructure exists but aging | Medium - may need enhancement | Site survey |
| Users accept digital-only payments | Low | Cash still common | High - need hybrid approach | Pilot testing |

### Root Cause Analysis

**Surface Problem:** Generic "Residentia" app doesn't meet community needs

**Five Whys:**
1. Why is the current app inadequate? Limited functionality, no service integration
2. Why limited functionality? Generic solution not tailored to resort community
3. Why generic solution? Previous vendor lacked domain expertise
4. Why lack of expertise? No thorough requirements analysis
5. **Root Cause:** Absence of comprehensive understanding of luxury community ecosystem

### Constraints

**Hard Constraints:**
- LFPDPPP compliance mandatory
- AES-256 encryption required for all PII
- 143 physical slips limit marina capacity
- Budget constraints for development

**Soft Constraints:**
- Launch before Q4 2026 tourist season
- Maintain backward compatibility with existing systems
- Support both English and Spanish languages

**Degrees of Freedom:**
- UI/UX design approach
- Specific IoT protocol selection
- Payment processor selection for external transactions

---

## Requirements

### TAG-REQ-FOUNDATION-001: Foundation & Infrastructure

#### Ubiquitous Requirements

**REQ-F-001:** The system shall always encrypt all personally identifiable information (PII) using AES-256 encryption at rest and in transit.

**REQ-F-002:** The system shall always log all security-relevant events (authentication, access, payments) with timestamp, user ID, and action performed.

**REQ-F-003:** The system shall always validate all input data using schema validation before processing.

**REQ-F-004:** The system shall always maintain database backups with point-in-time recovery capability.

**REQ-F-005:** The system shall always respond to health check endpoints within 100ms.

#### Event-Driven Requirements

**REQ-F-101:** WHEN a user registers, THEN the system shall send a verification email/SMS and create a pending account.

**REQ-F-102:** WHEN a user completes verification, THEN the system shall activate the account and send welcome notification.

**REQ-F-103:** WHEN authentication fails 5 times within 15 minutes, THEN the system shall temporarily lock the account for 30 minutes.

**REQ-F-104:** WHEN a system error occurs, THEN the system shall log the error with stack trace and notify administrators.

**REQ-F-105:** WHEN database connection fails, THEN the system shall attempt reconnection with exponential backoff.

#### State-Driven Requirements

**REQ-F-201:** IF a user account is inactive for 12 months, THEN the system shall flag for review per data retention policies.

**REQ-F-202:** IF system load exceeds 80% capacity, THEN the system shall trigger autoscaling.

**REQ-F-203:** IF API response time exceeds 1 second for P95, THEN the system shall alert operations team.

#### Unwanted Requirements

**REQ-F-301:** The system shall not store passwords in plaintext.

**REQ-F-302:** The system shall not expose internal error messages to end users.

**REQ-F-303:** The system shall not allow access without proper authentication.

**REQ-F-304:** The system shall not log sensitive payment information (PAN, CVV).

#### Optional Requirements

**REQ-F-401:** WHERE possible, the system shall support OAuth 2.0 authentication (Google, Apple).

**REQ-F-402:** WHERE possible, the system shall provide dark mode UI.

**REQ-F-403:** WHERE possible, the system shall support offline functionality for critical features.

---

### TAG-REQ-SEGURIDAD-002: Unified Security Module

#### Ubiquitous Requirements

**REQ-S-001:** The system shall always validate QR codes against a central database with real-time status.

**REQ-S-002:** The system shall always encrypt QR code payload to prevent tampering.

**REQ-S-003:** The system shall always maintain audit trail of all access attempts.

**REQ-S-004:** The system shall always validate LPR (License Plate Recognition) results against authorized vehicle database.

#### Event-Driven Requirements

**REQ-S-101:** WHEN a resident generates a visitor QR code, THEN the system shall create a unique, time-limited code with specified access permissions.

**REQ-S-102:** WHEN a visitor scans QR code at access point, THEN the system shall validate code and grant/deny access within 2 seconds.

**REQ-S-103:** WHEN QR code expires, THEN the system shall invalidate the code and deny any subsequent access attempts.

**REQ-S-104:** WHEN LPR system detects a license plate, THEN the system shall check authorization and automatically open gate if permitted.

**REQ-S-105:** WHEN a visitor arrives who is not pre-registered, THEN the system shall notify the resident for approval.

**REQ-S-106:** WHEN a provider/supplier checks in, THEN the system shall verify appointment and generate access credential.

**REQ-S-107:** WHEN access is denied, THEN the system shall log the event and notify security personnel.

**REQ-S-108:** WHEN a resident requests permanent access for family member, THEN the system shall require identity verification and admin approval.

#### State-Driven Requirements

**REQ-S-201:** IF a visitor QR code has been used, THEN the system shall mark as used and prevent reuse.

**REQ-S-202:** IF a visitor QR code is expired, THEN the system shall display expired message to security personnel.

**REQ-S-203:** IF a license plate is not recognized, THEN the system shall require manual verification.

**REQ-S-204:** IF a vehicle is associated with multiple residents, THEN the system shall allow access for any associated resident.

**REQ-S-205:** IF access attempt occurs outside permitted hours, THEN the system shall deny and notify security.

#### Unwanted Requirements

**REQ-S-301:** The system shall not allow QR code sharing (single-use enforcement).

**REQ-S-302:** The system shall not display resident personal information to security personnel without need-to-know.

**REQ-S-303:** The system shall not allow access gates to open without valid authentication.

**REQ-S-304:** The system shall not store unencrypted biometric data.

#### Optional Requirements

**REQ-S-401:** WHERE possible, the system shall support facial recognition for expedited access.

**REQ-S-402:** WHERE possible, the system shall provide real-time access notifications to residents.

**REQ-S-403:** WHERE possible, the system shall integrate with existing RFID card systems.

---

### TAG-REQ-MARINA-003: Nautical Module

#### Ubiquitous Requirements

**REQ-M-001:** The system shall always maintain accurate inventory of all 143 slips with real-time availability.

**REQ-M-002:** The system shall always validate boat dimensions against slip capacity before allowing reservation.

**REQ-M-003:** The system shall always calculate fees based on boat length and duration of stay.

**REQ-M-004:** The system shall always display current marina conditions (weather, tides) to users.

#### Event-Driven Requirements

**REQ-M-101:** WHEN a boat owner requests a slip reservation, THEN the system shall show available slips compatible with their boat size.

**REQ-M-102:** WHEN a reservation is confirmed, THEN the system shall block the slip for the specified dates and charge deposit.

**REQ-M-103:** WHEN a boat arrives at the marina, THEN the system shall allow check-in and assign the specific slip.

**REQ-M-104:** WHEN a boat departs, THEN the system shall release the slip for future reservations and calculate final charges.

**REQ-M-105:** WHEN a marina service is requested (water, electricity, pump-out), THEN the system shall notify marina staff.

**REQ-M-106:** WHEN payment for moorage is processed, THEN the system shall update the boat owner's balance and send receipt.

**REQ-M-107:** WHEN a slip becomes unavailable (maintenance), THEN the system shall update availability and notify affected reservations.

**REQ-M-108:** WHEN a boat exceeds time limit, THEN the system shall calculate overtime fees and notify owner.

#### State-Driven Requirements

**REQ-M-201:** IF a slip is occupied, THEN the system shall not allow overlapping reservations.

**REQ-M-202:** IF a boat length exceeds slip capacity, THEN the system shall not allow reservation and suggest alternatives.

**REQ-M-203:** IF a reservation is cancelled more than 48 hours in advance, THEN the system shall refund deposit fully.

**REQ-M-204:** IF a reservation is cancelled less than 48 hours in advance, THEN the system shall refund 50% of deposit.

**REQ-M-205:** IF payment is outstanding for more than 7 days, THEN the system shall suspend future reservation privileges.

#### Unwanted Requirements

**REQ-M-301:** The system shall not allow double-booking of slips.

**REQ-M-302:** The system shall not store payment card details (use tokenization).

**REQ-M-303:** The system shall not allow reservations without valid boat registration.

**REQ-M-304:** The system shall not disclose slip ownership information without authorization.

#### Optional Requirements

**REQ-M-401:** WHERE possible, the system shall provide mobile app check-in/check-out.

**REQ-M-402:** WHERE possible, the system shall send automated weather alerts.

**REQ-M-403:** WHERE possible, the system shall integrate with VHF radio systems for announcements.

---

### TAG-REQ-GOLF-004: Golf & Sports Module

#### Ubiquitous Requirements

**REQ-G-001:** The system shall always maintain real-time availability for tee times, courts, and classes.

**REQ-G-002:** The system shall always enforce booking rules (maximum advance booking, cancellation policies).

**REQ-G-003:** The system shall always validate player eligibility (membership status, handicap verification).

#### Event-Driven Requirements

**REQ-G-101:** WHEN a player requests a tee time, THEN the system shall show available slots for selected date/time.

**REQ-G-102:** WHEN a tee time is booked, THEN the system shall confirm reservation, charge fee, and send confirmation.

**REQ-G-103:** WHEN a class registration occurs, THEN the system shall add player to roster and notify instructor.

**REQ-G-104:** WHEN a sports court is reserved, THEN the system shall block the time slot and enable access control.

**REQ-G-105:** WHEN sunset time approaches, THEN the system shall automatically activate court lighting if reservations exist.

**REQ-G-106:** WHEN a reservation begins, THEN the system shall unlock smart locks/activate equipment for the reserved facility.

**REQ-G-107:** WHEN a reservation ends, THEN the system shall deactivate equipment and release the time slot.

**REQ-G-108:** WHEN a tournament is created, THEN the system shall block multiple time slots and manage player registrations.

#### State-Driven Requirements

**REQ-G-201:** IF a player is not a paid member, THEN the system shall require guest fee payment.

**REQ-G-202:** IF a cancellation occurs less than 24 hours before, THEN the system shall apply cancellation fee.

**REQ-G-203:** IF court lighting is activated, THEN the system shall monitor usage and auto-shutoff after reservation ends.

**REQ-G-204:** IF a player has outstanding fees, THEN the system shall prevent new reservations.

**REQ-G-205:** IF weather conditions are severe, THEN the system shall allow penalty-free cancellation.

#### Unwanted Requirements

**REQ-G-301:** The system shall not allow overbooking of facilities.

**REQ-G-302:** The system shall not allow manual override of lighting controls without audit trail.

**REQ-G-303:** The system shall not allow reservations for non-members during peak hours without proper authorization.

#### Optional Requirements

**REQ-G-401:** WHERE possible, the system shall provide handicap tracking and tournament pairing.

**REQ-G-402:** WHERE possible, the system shall integrate with golf GPS systems.

**REQ-G-403:** WHERE possible, the system shall provide automated scoring and leaderboard.

---

### TAG-REQ-MARKETPLACE-005: Local Marketplace Module

#### Ubiquitous Requirements

**REQ-MK-001:** The system shall always validate restaurant/partner availability status before accepting orders.

**REQ-MK-002:** The system shall always calculate delivery fees based on distance and order value.

**REQ-MK-003:** The system shall always maintain order status from placement to delivery.

#### Event-Driven Requirements

**REQ-MK-101:** WHEN a user browses restaurants, THEN the system shall display open restaurants with delivery to their location.

**REQ-MK-102:** WHEN a user places an order, THEN the system shall send confirmation to restaurant and assign delivery if applicable.

**REQ-MK-103:** WHEN a restaurant confirms order, THEN the system shall update status and notify user.

**REQ-MK-104:** WHEN a delivery driver accepts order, THEN the system shall provide tracking information to user.

**REQ-MK-105:** WHEN order is delivered, THEN the system shall mark complete and request user review.

**REQ-MK-106:** WHEN a restaurant makes a reservation, THEN the system shall confirm availability and send confirmation.

**REQ-MK-107:** WHEN a special promotion is created, THEN the system shall display to eligible users.

**REQ-MK-108:** WHEN an order is cancelled, THEN the system shall process refund according to cancellation policy.

#### State-Driven Requirements

**REQ-MK-201:** IF a restaurant is closed, THEN the system shall not accept orders and display next opening time.

**REQ-MK-202:** IF delivery address is outside service area, THEN the system shall offer pickup option only.

**REQ-MK-203:** IF order total exceeds restaurant capacity, THEN the system shall notify of potential delay.

**REQ-MK-204:** IF a user has incomplete payment, THEN the system shall prevent new orders.

#### Unwanted Requirements

**REQ-MK-301:** The system shall not display payment card details to restaurant staff.

**REQ-MK-302:** The system shall not allow order modification after restaurant confirmation.

**REQ-MK-303:** The system shall not share user contact information with restaurants without consent.

#### Optional Requirements

**REQ-MK-401:** WHERE possible, the system shall provide scheduled ordering.

**REQ-MK-402:** WHERE possible, the system shall offer group ordering for multiple users.

**REQ-MK-403:** WHERE possible, the system shall integrate with third-party delivery services.

---

### TAG-REQ-PAY-006: PA Pay Digital Wallet

#### Ubiquitous Requirements

**REQ-P-001:** The system shall always encrypt all wallet data using AES-256 encryption.

**REQ-P-002:** The system shall always maintain transaction history with immutable audit trail.

**REQ-P-003:** The system shall always validate sufficient balance before processing payments.

**REQ-P-004:** The system shall always calculate loyalty points on all qualifying transactions.

#### Event-Driven Requirements

**REQ-P-101:** WHEN a user creates a wallet, THEN the system shall generate unique wallet ID with initial balance of zero.

**REQ-P-102:** WHEN a user adds funds via external payment, THEN the system shall credit balance after payment processor confirmation.

**REQ-P-103:** WHEN a payment is initiated, THEN the system shall validate balance, debit amount, and credit recipient.

**REQ-P-104:** WHEN a transaction completes, THEN the system shall update balances, generate receipt, and award loyalty points.

**REQ-P-105:** WHEN loyalty points reach redemption threshold, THEN the system shall notify user of redemption options.

**REQ-P-106:** WHEN a suspicious transaction is detected, THEN the system shall flag for review and temporarily freeze wallet.

**REQ-P-107:** WHEN a user requests transaction history, THEN the system shall provide filtered, paginated results.

**REQ-P-108:** WHEN a refund is processed, THEN the system shall credit original payment method and reverse loyalty points if applicable.

#### State-Driven Requirements

**REQ-P-201:** IF a wallet balance is insufficient, THEN the system shall decline payment and suggest funding options.

**REQ-P-202:** IF a transaction amount exceeds daily limit, THEN the system shall require additional verification.

**REQ-P-203:** IF a wallet is inactive for 12 months, THEN the system shall charge dormancy fee per terms of service.

**REQ-P-204:** IF fraud is confirmed, THEN the system shall permanently freeze wallet and escalate to security.

**REQ-P-205:** IF loyalty points expire, THEN the system shall notify user 30 days before expiration.

#### Unwanted Requirements

**REQ-P-301:** The system shall not store payment card details (use tokenization only).

**REQ-P-302:** The system shall not allow wallet-to-external bank transfers without KYC verification.

**REQ-P-303:** The system shall not display full wallet balance to support staff without authorization.

#### Optional Requirements

**REQ-P-401:** WHERE possible, the system shall support QR code payments between users.

**REQ-P-402:** WHERE possible, the system shall integrate with external payment processors (Stripe, PayPal).

**REQ-P-403:** WHERE possible, the system shall offer virtual and physical card options.

---

### TAG-REQ-COMPLIANCE-007: Regulatory Compliance

#### Ubiquitous Requirements

**REQ-C-001:** The system shall always comply with LFPDPPP data protection requirements.

**REQ-C-002:** The system shall always obtain explicit consent before collecting personal data.

**REQ-C-003:** The system shall always honor ARCO rights (Access, Rectification, Cancellation, Opposition).

#### Event-Driven Requirements

**REQ-C-101:** WHEN a user exercises ARCO rights, THEN the system shall respond within legal timeframe (15-20 days).

**REQ-C-102:** WHEN a user requests data access, THEN the system shall provide complete personal data export.

**REQ-C-103:** WHEN a user requests data deletion, THEN the system shall anonymize/delete data per retention policies.

**REQ-C-104:** WHEN a data breach occurs, THEN the system shall notify authorities within 72 hours and affected users.

**REQ-C-105:** WHEN consent is withdrawn, THEN the system shall cease data processing for the withdrawn purposes.

#### State-Driven Requirements

**REQ-C-201:** IF personal data is no longer needed for original purpose, THEN the system shall delete or anonymize per retention policy.

**REQ-C-202:** IF a data subject requests are denied, THEN the system shall provide legal justification.

#### Unwanted Requirements

**REQ-C-301:** The system shall not collect data beyond what is necessary for stated purposes.

**REQ-C-302:** The system shall not share personal data with third parties without explicit consent.

**REQ-C-303:** The system shall not retain data longer than legally required or necessary.

---

## Specifications

### Data Model Overview

#### Core Entities

**User**
- id: UUID (PK)
- email: String (unique, encrypted)
- phone: String (encrypted)
- name: String (encrypted)
- role: Enum (resident, staff, admin, provider)
- status: Enum (active, inactive, suspended)
- wallet_id: UUID (FK)
- created_at: Timestamp
- updated_at: Timestamp

**Property**
- id: UUID (PK)
- user_id: UUID (FK)
- address: String (encrypted)
- property_type: Enum (residence, business)
- resident_count: Integer

**Vehicle**
- id: UUID (PK)
- user_id: UUID (FK)
- license_plate: String (encrypted)
- make: String
- model: String
- color: String
- is_authorized: Boolean

**Visitor**
- id: UUID (PK)
- host_id: UUID (FK)
- name: String (encrypted)
- visit_date: Date
- access_code: String (encrypted QR)
- status: Enum (pending, active, completed, cancelled)

#### Marina Entities

**Slip**
- id: UUID (PK)
- slip_number: String
- max_length_ft: Integer
- max_beam_ft: Integer
- services: Array (water, electricity, wifi, pumpout)
- is_available: Boolean
- hourly_rate: Decimal

**Boat**
- id: UUID (PK)
- user_id: UUID (FK)
- name: String
- length_ft: Integer
- beam_ft: Integer
- registration_number: String

**MarinaReservation**
- id: UUID (PK)
- slip_id: UUID (FK)
- boat_id: UUID (FK)
- check_in: Timestamp
- check_out: Timestamp
- status: Enum (pending, active, completed, cancelled)
- total_fee: Decimal

#### Golf & Sports Entities

**Facility**
- id: UUID (PK)
- name: String
- type: Enum (golf_course, tennis_court, pickleball, gym, pool)
- capacity: Integer
- has_lighting: Boolean
- hourly_rate: Decimal

**Reservation**
- id: UUID (PK)
- facility_id: UUID (FK)
- user_id: UUID (FK)
- start_time: Timestamp
- end_time: Timestamp
- status: Enum (pending, confirmed, active, completed, cancelled)

**Class**
- id: UUID (PK)
- facility_id: UUID (FK)
- instructor_id: UUID (FK)
- schedule: Timestamp
- max_participants: Integer
- skill_level: Enum (beginner, intermediate, advanced)

#### Marketplace Entities

**Restaurant**
- id: UUID (PK)
- name: String
- address: String
- cuisine_type: String
- is_active: Boolean
- delivery_radius_km: Decimal
- commission_rate: Decimal

**Order**
- id: UUID (PK)
- restaurant_id: UUID (FK)
- user_id: UUID (FK)
- items: JSON
- total: Decimal
- delivery_fee: Decimal
- status: Enum (pending, confirmed, preparing, ready, delivering, completed, cancelled)
- delivery_address: String (encrypted)

#### Payment Entities

**Wallet**
- id: UUID (PK)
- user_id: UUID (FK, unique)
- balance: Decimal
- currency: String (MXN)
- is_frozen: Boolean

**Transaction**
- id: UUID (PK)
- wallet_id: UUID (FK)
- type: Enum (credit, debit, refund)
- amount: Decimal
- description: String
- reference_id: UUID
- created_at: Timestamp

**LoyaltyPoints**
- id: UUID (PK)
- user_id: UUID (FK)
- balance: Integer
- expiry_date: Date

### API Architecture

#### Authentication & Authorization

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

#### Security Module

```
POST   /api/v1/security/qr/generate
GET    /api/v1/security/qr/validate/:code
POST   /api/v1/security/visitor/register
GET    /api/v1/security/visitor/:id
POST   /api/v1/security/vehicle/add
GET    /api/v1/security/access/logs
```

#### Marina Module

```
GET    /api/v1/marina/slips/available
POST   /api/v1/marina/reservations
GET    /api/v1/marina/reservations/:id
PUT    /api/v1/marina/reservations/:id
DELETE /api/v1/marina/reservations/:id
GET    /api/v1/marina/boats/:id
POST   /api/v1/marina/checkin/:reservation_id
POST   /api/v1/marina/checkout/:reservation_id
```

#### Golf & Sports Module

```
GET    /api/v1/sports/facilities
GET    /api/v1/sports/facilities/:id/availability
POST   /api/v1/sports/reservations
GET    /api/v1/sports/reservations/:id
GET    /api/v1/sports/classes
POST   /api/v1/sports/classes/:id/register
POST   /api/v1/sports/lighting/control
```

#### Marketplace Module

```
GET    /api/v1/marketplace/restaurants
GET    /api/v1/marketplace/restaurants/:id/menu
POST   /api/v1/marketplace/orders
GET    /api/v1/marketplace/orders/:id
PUT    /api/v1/marketplace/orders/:id/status
POST   /api/v1/marketplace/reservations
GET    /api/v1/marketplace/delivery/tracking/:order_id
```

#### Payment Module

```
POST   /api/v1/payments/wallet/create
GET    /api/v1/payments/wallet/balance
POST   /api/v1/payments/wallet/topup
POST   /api/v1/payments/transactions
GET    /api/v1/payments/transactions/:wallet_id
GET    /api/v1/payments/loyalty/balance
POST   /api/v1/payments/loyalty/redeem
```

#### Compliance Module

```
POST   /api/v1/compliance/data/export
POST   /api/v1/compliance/data/delete
POST   /api/v1/compliance/consent/withdraw
GET    /api/v1/compliance/privacy-policy
```

### IoT Integration Points

#### Smart Lighting (Golf/Sports Courts)
- Protocol: MQTT
- Topics: `sports/lighting/{facility_id}/command`
- Payload: `{"action": "on/off", "duration": minutes}`
- Response: `{"status": "success", "current_state": "on"}`

#### Access Control (Gates)
- Protocol: REST API
- Endpoint: `POST /api/v1/access/gate/{gate_id}/open`
- Authentication: Bearer token + QR validation

#### Marina Sensors (Slip Availability)
- Protocol: MQTT
- Topics: `marina/slip/{slip_id}/status`
- Payload: `{"occupied": true, "boat_id": "uuid"}`

---

## References

### Related Documents

- Business Requirements: `.moai/project/product.md`
- Technical Architecture: `.moai/project/tech.md`
- Project Structure: `.moai/project/structure.md`

### Standards

- EARS Format: Easy Approach to Requirements Syntax (Alistair Mavin, 2009)
- OWASP Top 10: 2021
- LFPDPPP: Mexican Federal Data Protection Law
- AES-256: NIST Standard

### Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-02-21 | Initial SPEC creation | MoAI System |

---

**TAG-PLAN-PA-ECOSYSTEM-001** | Implementation plan at `plan.md`
**TAG-ACC-PA-ECOSYSTEM-001** | Acceptance criteria at `acceptance.md`
