/* ─────────────────────────────────────────────────────────────────────────
 * TypeScript interfaces mirroring every Java DTO in pl.pse.aero.dto
 * and every domain enum used in those DTOs.
 * ───────────────────────────────────────────────────────────────────────── */

// ── Enums ─────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'PLANNER' | 'SUPERVISOR' | 'PILOT';

export type CrewRole = 'PILOT' | 'OBSERVER';

export type HelicopterStatus = 'ACTIVE' | 'INACTIVE';

// ── Auth ──────────────────────────────────────────────────────────────────

/** POST /api/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

// ── Users ─────────────────────────────────────────────────────────────────

/** Response from GET /api/users, GET /api/users/{id}, POST, PUT */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

/**
 * POST /api/users — password required on create.
 * PUT  /api/users/{id} — password optional on update.
 */
export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  /** Required on create, optional on update */
  password?: string;
  role: UserRole;
  /** Links user to an existing CrewMember record (optional) */
  crewMemberId?: string;
}

// ── Crew Members ──────────────────────────────────────────────────────────

/** Response from GET /api/crew-members, GET /api/crew-members/{id}, POST, PUT */
export interface CrewMemberResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  weightKg: number;
  role: CrewRole;
  /** Only present for PILOT role */
  pilotLicenseNumber?: string | null;
  /** Only present for PILOT role; ISO-8601 date string (YYYY-MM-DD) */
  licenseExpiryDate?: string | null;
  /** ISO-8601 date string (YYYY-MM-DD) */
  trainingExpiryDate: string;
}

/** POST /api/crew-members, PUT /api/crew-members/{id} */
export interface CrewMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  /** 30–200 kg */
  weightKg: number;
  role: CrewRole;
  /** Required when role === 'PILOT', max 30 chars */
  pilotLicenseNumber?: string;
  /** Required when role === 'PILOT'; ISO-8601 date string */
  licenseExpiryDate?: string;
  /** ISO-8601 date string */
  trainingExpiryDate: string;
}

// ── Helicopters ───────────────────────────────────────────────────────────

/** Response from GET /api/helicopters, GET /api/helicopters/{id}, POST, PUT */
export interface HelicopterResponse {
  id: string;
  registrationNumber: string;
  type: string;
  description?: string | null;
  maxCrewCount: number;
  maxCrewWeightKg: number;
  status: HelicopterStatus;
  /** ISO-8601 date string; required when status === 'ACTIVE' */
  inspectionExpiryDate?: string | null;
  rangeKm: number;
}

/** POST /api/helicopters, PUT /api/helicopters/{id} */
export interface HelicopterRequest {
  /** Max 30 chars */
  registrationNumber: string;
  /** Max 100 chars */
  type: string;
  /** Max 100 chars; optional */
  description?: string;
  /** 1–10 */
  maxCrewCount: number;
  /** 1–1000 kg */
  maxCrewWeightKg: number;
  status: HelicopterStatus;
  /** ISO-8601 date string; required when status === 'ACTIVE' */
  inspectionExpiryDate?: string;
  /** 1–1000 km */
  rangeKm: number;
}

// ── Landing Sites ─────────────────────────────────────────────────────────

/** Response from GET /api/landing-sites, GET /api/landing-sites/{id}, POST, PUT */
export interface LandingSiteResponse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

/** POST /api/landing-sites, PUT /api/landing-sites/{id} */
export interface LandingSiteRequest {
  /** Max 200 chars */
  name: string;
  latitude: number;
  longitude: number;
}

// ── Operations ───────────────────────────────────────────────────────

export type OperationStatus =
  | 'SUBMITTED'
  | 'REJECTED'
  | 'CONFIRMED'
  | 'SCHEDULED'
  | 'PARTIALLY_COMPLETED'
  | 'COMPLETED'
  | 'CANCELLED';

export type ActivityType =
  | 'VISUAL_INSPECTION'
  | 'SCAN_3D'
  | 'FAULT_LOCATION'
  | 'PHOTOS'
  | 'PATROL';

export interface OperationComment {
  content: string;
  authorEmail: string;
  createdAt: string;
}

export interface OperationChangeHistory {
  fieldName: string;
  oldValue: string;
  newValue: string;
  changedByEmail: string;
  changedAt: string;
}

export interface OperationResponse {
  id: string;
  orderNumber: string;
  shortDescription: string;
  kmlFilePath?: string | null;
  kmlPoints?: number[][] | null;
  proposedDateEarliest?: string | null;
  proposedDateLatest?: string | null;
  additionalInfo?: string | null;
  routeLengthKm: number;
  plannedDateEarliest?: string | null;
  plannedDateLatest?: string | null;
  status: OperationStatus;
  statusLabel: string;
  createdByEmail?: string | null;
  postCompletionNotes?: string | null;
  activityTypes: ActivityType[];
  contacts: string[];
  comments: OperationComment[];
  changeHistory: OperationChangeHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface OperationListResponse {
  id: string;
  orderNumber: string;
  activityTypes: ActivityType[];
  proposedDateEarliest?: string | null;
  proposedDateLatest?: string | null;
  plannedDateEarliest?: string | null;
  plannedDateLatest?: string | null;
  status: OperationStatus;
  statusLabel: string;
}

export interface OperationRequest {
  orderNumber: string;
  shortDescription: string;
  activityTypes: ActivityType[];
  proposedDateEarliest?: string;
  proposedDateLatest?: string;
  additionalInfo?: string;
  plannedDateEarliest?: string;
  plannedDateLatest?: string;
  contacts?: string[];
  postCompletionNotes?: string;
  kmlFilePath?: string;
  kmlPoints?: number[][];
  routeLengthKm?: number;
}

export interface CommentRequest {
  content: string;
}

export interface StatusChangeRequest {
  action: string;
}

export interface KmlProcessingResult {
  filePath: string;
  points: number[][];
  routeLengthKm: number;
}

// ── Orders ───────────────────────────────────────────────────────────

export type OrderStatus =
  | 'SUBMITTED'
  | 'SENT_FOR_APPROVAL'
  | 'REJECTED'
  | 'APPROVED'
  | 'PARTIALLY_COMPLETED'
  | 'COMPLETED'
  | 'NOT_COMPLETED';

export interface OrderResponse {
  id: string;
  plannedDeparture: string;
  plannedArrival: string;
  pilotId: string;
  status: OrderStatus;
  statusLabel: string;
  helicopterId: string;
  crewMemberIds: string[];
  crewWeightKg: number;
  departureSiteId: string;
  arrivalSiteId: string;
  operationIds: string[];
  estimatedRouteLengthKm: number;
  actualDeparture?: string | null;
  actualArrival?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  id: string;
  plannedDeparture: string;
  helicopterId: string;
  pilotId: string;
  status: OrderStatus;
  statusLabel: string;
}

export interface OrderRequest {
  plannedDeparture: string;
  plannedArrival: string;
  helicopterId: string;
  crewMemberIds?: string[];
  departureSiteId: string;
  arrivalSiteId: string;
  operationIds?: string[];
  actualDeparture?: string;
  actualArrival?: string;
}

// ── Dictionaries ──────────────────────────────────────────────────────────

/**
 * Single entry returned by all /api/dictionaries/* endpoints.
 * `value` is the enum constant name (e.g. "PILOT"),
 * `label` is the human-readable Polish label (e.g. "Pilot").
 */
export interface DictionaryEntry {
  value: string;
  label: string;
}
