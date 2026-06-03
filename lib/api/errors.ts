/**
 * Error envelope from the backend per CONVENTIONS.md §Errors.
 *
 *   { "error": { "code": "BORROW_ITEM_UNAVAILABLE", "message": "...", "i18nKey": "errors.borrowItemUnavailable", "details": {...} } }
 *
 * The `code` field is authoritative — `i18nKey` is convenience. We map codes to
 * i18nKeys client-side so the UI doesn't rely on the server sending the right key.
 */

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_FAILED"
  | "UNAUTHENTICATED"
  | "TOKEN_EXPIRED"
  | "FORBIDDEN"
  | "NOT_IT_MEMBER"
  | "RESOURCE_NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "BORROW_ITEM_UNAVAILABLE"
  | "BORROW_LIMIT_EXCEEDED"
  | "BORROW_NOT_READY_FOR_HANDOVER"
  | "BORROW_ALREADY_RETURNED"
  | "BORROW_REQUIRES_APPROVAL"
  | "ROOM_BOOKING_CONFLICT"
  | "ROOM_BOOKING_OUTSIDE_HOURS"
  | "ROOM_BOOKING_TOO_LONG"
  | "ROOM_BOOKING_TOO_SOON"
  | "ROOM_BOOKING_TOO_FAR"
  | "ROOM_CAPACITY_EXCEEDED"
  | "PROCUREMENT_NEEDS_ADMIN_APPROVAL"
  | "INFRA_SPEC_WARNING"
  | "LICENSE_PERIOD_INVALID"
  | "FILE_TOO_LARGE"
  | "FILE_TYPE_NOT_ALLOWED"
  | "EXTERNAL_SESSION_REQUIRED"
  | "EXTERNAL_SESSION_EXPIRED"
  | "TICKET_LOOKUP_FAILED"
  | "STATE_TRANSITION_INVALID"
  | "DUPLICATE";

export const ERROR_CODE_TO_I18N: Record<ApiErrorCode, string> = {
  BAD_REQUEST: "errors.badRequest",
  VALIDATION_FAILED: "errors.validationFailed",
  UNAUTHENTICATED: "errors.unauthenticated",
  TOKEN_EXPIRED: "errors.tokenExpired",
  FORBIDDEN: "errors.forbidden",
  NOT_IT_MEMBER: "errors.notItMember",
  RESOURCE_NOT_FOUND: "errors.resourceNotFound",
  CONFLICT: "errors.conflict",
  RATE_LIMITED: "errors.rateLimited",
  INTERNAL_ERROR: "errors.internalError",
  SERVICE_UNAVAILABLE: "errors.serviceUnavailable",
  BORROW_ITEM_UNAVAILABLE: "errors.borrowItemUnavailable",
  BORROW_LIMIT_EXCEEDED: "errors.borrowLimitExceeded",
  BORROW_NOT_READY_FOR_HANDOVER: "errors.borrowNotReadyForHandover",
  BORROW_ALREADY_RETURNED: "errors.borrowAlreadyReturned",
  BORROW_REQUIRES_APPROVAL: "errors.borrowRequiresApproval",
  ROOM_BOOKING_CONFLICT: "errors.roomBookingConflict",
  ROOM_BOOKING_OUTSIDE_HOURS: "errors.roomBookingOutsideHours",
  ROOM_BOOKING_TOO_LONG: "errors.roomBookingTooLong",
  ROOM_BOOKING_TOO_SOON: "errors.roomBookingTooSoon",
  ROOM_BOOKING_TOO_FAR: "errors.roomBookingTooFar",
  ROOM_CAPACITY_EXCEEDED: "errors.roomCapacityExceeded",
  PROCUREMENT_NEEDS_ADMIN_APPROVAL: "errors.procurementNeedsAdminApproval",
  INFRA_SPEC_WARNING: "errors.infraSpecWarning",
  LICENSE_PERIOD_INVALID: "errors.licensePeriodInvalid",
  FILE_TOO_LARGE: "errors.fileTooLarge",
  FILE_TYPE_NOT_ALLOWED: "errors.fileTypeNotAllowed",
  EXTERNAL_SESSION_REQUIRED: "errors.externalSessionRequired",
  EXTERNAL_SESSION_EXPIRED: "errors.externalSessionExpired",
  TICKET_LOOKUP_FAILED: "errors.ticketLookupFailed",
  STATE_TRANSITION_INVALID: "errors.stateTransitionInvalid",
  DUPLICATE: "errors.duplicate",
};

export interface ApiErrorBody {
  code: ApiErrorCode | string;
  message?: string;
  i18nKey?: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  public readonly code: ApiErrorCode | string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;
  public readonly i18nKey: string;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message ?? body.code);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.details = body.details;
    this.i18nKey = (ERROR_CODE_TO_I18N as Record<string, string>)[body.code] ?? body.i18nKey ?? "errors.internalError";
  }

  isCode(code: ApiErrorCode): boolean {
    return this.code === code;
  }
}

/** Field validation errors come back under `details.fields: Record<string, string[]>`. */
export function extractFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  const fields = (error.details?.fields ?? {}) as Record<string, string[] | string>;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = Array.isArray(v) ? v[0] : v;
  }
  return out;
}
