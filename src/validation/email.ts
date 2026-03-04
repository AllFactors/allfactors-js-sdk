import { ValidationError } from '../errors';
import { LIMITS } from './limits';
import { sanitizeString } from './sanitize';

/** Loose email format: local@domain.tld */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates email: datatype string, format, and length (1–254 after sanitization).
 * Sanitizes: trim, NFC normalization, control char rejection, whitespace normalization, lowercase domain.
 * @returns Sanitized email with lowercase domain
 * @throws ValidationError when validation fails
 */
export function validateEmail(value: unknown, field: string = 'email'): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`, field);
  }
  
  // Sanitize
  let sanitized = sanitizeString(value, {
    trim: true,
    normalizeUnicode: true,
    rejectControlChars: true,
    normalizeWhitespace: true,
    toLowerCase: false, // We'll lowercase domain part only
  });
  
  // Split and lowercase domain
  const atIndex = sanitized.lastIndexOf('@');
  if (atIndex > 0) {
    const local = sanitized.slice(0, atIndex);
    const domain = sanitized.slice(atIndex + 1).toLowerCase();
    sanitized = local + '@' + domain;
  }
  
  // Validate length
  if (sanitized.length < LIMITS.EMAIL_MIN_LENGTH || sanitized.length > LIMITS.EMAIL_MAX_LENGTH) {
    throw new ValidationError(
      `${field}: Length must be between ${LIMITS.EMAIL_MIN_LENGTH} and ${LIMITS.EMAIL_MAX_LENGTH}`,
      field
    );
  }
  
  // Validate format
  if (!EMAIL_REGEX.test(sanitized)) {
    throw new ValidationError(`${field}: Invalid format`, field);
  }
  
  return sanitized;
}
