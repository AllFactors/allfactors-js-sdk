import { ValidationError } from '../errors';
import { LIMITS } from './limits';
import { sanitizeString } from './sanitize';

/** Hostname-safe: letters, digits, hyphens, dots; no spaces or control chars */
const HOSTNAME_REGEX = /^[a-zA-Z0-9.-]+$/;

/**
 * Validates hostname: type string, non-empty, max length 253, loose format (no spaces, hostname-safe chars only).
 * Sanitizes: trim, NFC normalization, control char rejection, whitespace normalization, lowercase.
 * @returns Sanitized lowercase hostname
 * @throws ValidationError when validation fails
 */
export function validateHostname(value: unknown, field: string = 'hostname'): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`, field);
  }
  
  // Sanitize (including lowercase for DNS case-insensitivity)
  const sanitized = sanitizeString(value, {
    trim: true,
    normalizeUnicode: true,
    rejectControlChars: true,
    normalizeWhitespace: true,
    toLowerCase: true,
  });
  
  if (sanitized.length === 0) {
    throw new ValidationError(`${field} must be a non-empty string`, field);
  }
  if (sanitized.length > LIMITS.HOSTNAME_MAX_LENGTH) {
    throw new ValidationError(
      `${field}: Max length is ${LIMITS.HOSTNAME_MAX_LENGTH} characters`,
      field
    );
  }
  if (!HOSTNAME_REGEX.test(sanitized)) {
    throw new ValidationError(`${field}: Invalid format`, field);
  }
  
  return sanitized;
}
