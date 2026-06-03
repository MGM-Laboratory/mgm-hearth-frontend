import { describe, expect, it } from "vitest";
import { ApiError, ERROR_CODE_TO_I18N, extractFieldErrors } from "@/lib/api/errors";

describe("ApiError", () => {
  it("maps known codes to i18n keys", () => {
    const e = new ApiError(403, { code: "NOT_IT_MEMBER", message: "no" });
    expect(e.i18nKey).toBe(ERROR_CODE_TO_I18N.NOT_IT_MEMBER);
    expect(e.isCode("NOT_IT_MEMBER")).toBe(true);
  });

  it("falls back to internalError for unknown codes", () => {
    const e = new ApiError(500, { code: "WHO_KNOWS", message: "boom" });
    expect(e.i18nKey).toBe("errors.internalError");
  });

  it("prefers server-supplied i18nKey for unknown codes", () => {
    const e = new ApiError(500, { code: "WHO_KNOWS", message: "boom", i18nKey: "errors.custom" });
    expect(e.i18nKey).toBe("errors.custom");
  });

  it("extracts field errors from details.fields", () => {
    const e = new ApiError(422, {
      code: "VALIDATION_FAILED",
      message: "no",
      details: { fields: { name: ["required"], age: "too low" } },
    });
    expect(extractFieldErrors(e)).toEqual({ name: "required", age: "too low" });
  });

  it("covers all 30 canonical codes", () => {
    const expected = [
      "BAD_REQUEST", "VALIDATION_FAILED", "UNAUTHENTICATED", "TOKEN_EXPIRED", "FORBIDDEN",
      "NOT_IT_MEMBER", "RESOURCE_NOT_FOUND", "CONFLICT", "RATE_LIMITED", "INTERNAL_ERROR",
      "SERVICE_UNAVAILABLE", "BORROW_ITEM_UNAVAILABLE", "BORROW_LIMIT_EXCEEDED",
      "BORROW_NOT_READY_FOR_HANDOVER", "BORROW_ALREADY_RETURNED", "BORROW_REQUIRES_APPROVAL",
      "ROOM_BOOKING_CONFLICT", "ROOM_BOOKING_OUTSIDE_HOURS", "ROOM_BOOKING_TOO_LONG",
      "ROOM_BOOKING_TOO_SOON", "ROOM_BOOKING_TOO_FAR", "ROOM_CAPACITY_EXCEEDED",
      "PROCUREMENT_NEEDS_ADMIN_APPROVAL", "INFRA_SPEC_WARNING", "LICENSE_PERIOD_INVALID",
      "FILE_TOO_LARGE", "FILE_TYPE_NOT_ALLOWED", "EXTERNAL_SESSION_REQUIRED",
      "EXTERNAL_SESSION_EXPIRED", "TICKET_LOOKUP_FAILED", "STATE_TRANSITION_INVALID", "DUPLICATE",
    ];
    for (const code of expected) {
      expect(ERROR_CODE_TO_I18N).toHaveProperty(code);
    }
  });
});
