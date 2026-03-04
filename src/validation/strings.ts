import { ValidationError } from '../errors';
import { sanitizeString } from './sanitize';

export interface ValidateStringOptions {
  field: string;
  maxLength?: number;
  minLength?: number;
  allowEmpty?: boolean;
  /** When true, error messages must never include the actual value (for secrets). */
  secret?: boolean;
}

/**
 * Validates a string: type check, optional length bounds, optional non-empty.
 * Sanitizes: trim, NFC normalization, control char rejection, whitespace normalization (except for secrets).
 * For secret fields (accessKey, secretKey, proxy.auth), messages never include the value.
 * @returns Sanitized string
 * @throws ValidationError when validation fails
 */
export function validateString(
  value: unknown,
  options: ValidateStringOptions
): string {
  const { field, maxLength, minLength = 0, allowEmpty = false, secret = false } = options;

  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`, field);
  }

  // Sanitize (skip whitespace normalization for secrets)
  const sanitized = sanitizeString(value, {
    trim: true,
    normalizeUnicode: true,
    rejectControlChars: true,
    normalizeWhitespace: !secret, // Don't normalize whitespace in secrets
    toLowerCase: false,
    isSecret: secret,
    field,
  });

  const len = sanitized.length;
  if (!allowEmpty && len === 0) {
    throw new ValidationError(`${field} must be a non-empty string`, field);
  }
  if (minLength !== undefined && len < minLength) {
    throw new ValidationError(
      `${field}: Min length is ${minLength} characters`,
      field
    );
  }
  if (maxLength !== undefined && len > maxLength) {
    throw new ValidationError(
      `${field}: Max length is ${maxLength} characters`,
      field
    );
  }
  
  return sanitized;
}
