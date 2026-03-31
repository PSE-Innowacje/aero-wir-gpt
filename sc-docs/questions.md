# AERO — Open Questions

Answer these at your own pace. Write your answer below each question — I'll pick them up in our next session.

---

## Q1: User ↔ CrewMember Linkage

The PRD has **Users** (login accounts, section 6.4) and **Crew Members** (flight personnel, section 6.2) as separate entities. But when a Pilot creates a flight order, the "pilot" field auto-fills from the logged-in user — and it references a CrewMember record.

**How should we link them?**
- (a) Match by email — if a User and CrewMember share the same email, they're the same person
- (b) Add an explicit FK from User to CrewMember (nullable, only for pilots)
- (c) Merge them into one entity with optional login fields

My recommendation: **(a)** — simplest, no schema changes, works with the existing design.

**Your answer:** **(b)** — Explicit FK from User to CrewMember (nullable, only for pilots)


---

## Q2: Database Setup

The plan mentions Couchbase. For local development:
- (a) Docker Compose (I'll add a `docker-compose.yml` with Couchbase)
- (b) You have Couchbase installed locally — tell me the connection details
- (c) Use an embedded alternative for now, Couchbase later

My recommendation: **(a)** — reproducible, no local install needed.

**Your answer:** **(a)** — Docker Compose


---

## Q3: UI Language

The PRD is entirely in Polish. The menu labels, status names, form labels — everything is Polish. Should the application UI be:
- (a) Fully Polish (matching the PRD exactly)
- (b) English UI with Polish domain terms where necessary
- (c) Polish UI but English code (variable names, API fields in English)

My recommendation: **(c)** — Polish-facing UI, English codebase internals. Status enums, API field names, variable names in English; all visible labels/messages in Polish.

**Your answer:** **(c)** — Polish UI, English code


---

## Q4: Java Version

The current project has a basic Gradle setup with no Java version specified. Spring Boot 3.x requires Java 17+. Which do you have / prefer?
- (a) Java 17
- (b) Java 21
- (c) Whatever is on my machine — let me check: `java -version`

**Your answer:** **(b)** — Java 21


---

## Q5: Crew Member Roles — Fixed or Configurable?

The PRD mentions crew roles like "Pilot" and "Obserwator" (Observer). Should this be:
- (a) A fixed enum in code (PILOT, OBSERVER) — simple, matches PRD
- (b) A database dictionary table — admin can add new roles later

My recommendation: **(a)** — the PRD only mentions two roles, and pilot role has special validation logic (license). A dictionary adds complexity with no clear requirement.

**Your answer:** **(a)** — Fixed enum


---

## Q6: Activity Types — Fixed or Configurable?

Flight operations have "rodzaj czynnosci" (activity types) like "oględziny wizualne", "skan 3D", etc. Same question:
- (a) Fixed enum in code
- (b) Database dictionary (admin-editable)

The PRD says "ze slownika" (from dictionary), which suggests a lookup, but the Admin section has no "dictionaries" management screen.

My recommendation: **(a)** for MVP — hardcoded list. Can move to DB later if needed.

**Your answer:** **(a)** — Fixed enum


---

## Q7: KML Sample Files

Do you have sample KML files I can use for testing the upload and map display? If not, I'll generate synthetic ones with Polish coordinates.

**Your answer:** No sample files available — generate synthetic KML test data with Polish coordinates


---

## Q8: Flight Order → Route Length Calculation

The PRD says "szacowana dlugsc trasy" (estimated route length) is required but section 9 ("Out of scope") explicitly excludes "automatic route length calculation" and "optimal route display."

Does this mean the pilot **manually enters** the estimated route length? Or should we still auto-calculate from the combined KML points of selected operations + landing sites?

The plan.md says "auto-calculated" — I'll follow that unless you say otherwise.

**Your answer:** Auto-calculate (follow plan.md)


---

## Q9: Deployment Target

Is this meant to run:
- (a) Locally only (demo/dev machine)
- (b) On a server (which? VPS, cloud, university infra?)
- (c) Don't worry about deployment — just make it run locally

**Your answer:** **(a)** — Local only


---

## Q10: The `src/` Directory

The project currently has a `src/main/java/com/nullterrier/Main.java` at the root level. The plan moves everything into `backend/`. Should I:
- (a) Delete the root `src/` and restructure into `backend/` + `frontend/`
- (b) Keep root `src/` as the backend (no `backend/` subdirectory)

My recommendation: **(a)** — matches the plan, cleaner monorepo separation.

**Your answer:** **(a)** — Delete root src/, restructure into backend/ + frontend/

