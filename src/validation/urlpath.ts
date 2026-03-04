import { ValidationError } from '../errors';
import { sanitizeString } from './sanitize';
import { LIMITS } from './limits';

const VALID_PATH_RE = /^\/[a-zA-Z0-9\-._~!$&'()*+,;=:@/]*$/;

export function validatePath(value: unknown): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`path must be a string`, 'path');
  }
  const sanitized = sanitizeString(value, {
    trim: true,
    normalizeUnicode: true,
    rejectControlChars: true,
    normalizeWhitespace: false, // preserve path structure
    toLowerCase: false,
    field: 'path',
  });
  if (!VALID_PATH_RE.test(sanitized)) {
    throw new ValidationError(`path must be a valid URL path starting with '/'`, 'path');
  }
  if (sanitized.length > LIMITS.PATH_MAX_LENGTH) {
    throw new ValidationError(`path: Max length is ${LIMITS.PATH_MAX_LENGTH} characters`, 'path');
  }
  return sanitized;
}
