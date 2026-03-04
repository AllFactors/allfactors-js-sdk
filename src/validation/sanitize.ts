import { ValidationError } from '../errors';

export interface SanitizeOptions {
  trim?: boolean;
  normalizeUnicode?: boolean;
  rejectControlChars?: boolean;
  normalizeWhitespace?: boolean;
  toLowerCase?: boolean;
  isSecret?: boolean; // Don't normalize whitespace for secrets
  field?: string; // Used in ValidationError to identify the offending field
}

/**
 * Sanitize a string with various normalization options.
 * @param value The string to sanitize
 * @param options Sanitization options
 * @returns Sanitized string
 * @throws ValidationError if control characters are found and rejectControlChars is true
 */
export function sanitizeString(
  value: string,
  options: SanitizeOptions = {}
): string {
  let result = value;
  
  const {
    trim = true,
    normalizeUnicode = true,
    rejectControlChars = true,
    normalizeWhitespace = true,
    toLowerCase = false,
    isSecret = false,
    field,
  } = options;
  
  // 1. Trim
  if (trim) {
    result = result.trim();
  }
  
  // 2. Unicode normalization
  if (normalizeUnicode) {
    result = result.normalize('NFC');
  }
  
  // 3. Reject control characters
  if (rejectControlChars) {
    // U+0000-U+001F, U+007F-U+009F
    const controlCharRegex = /[\u0000-\u001F\u007F-\u009F]/;
    if (controlCharRegex.test(result)) {
      throw new ValidationError(
        'Input contains invalid control characters',
        field ?? 'sanitize'
      );
    }
  }
  
  // 4. Normalize internal whitespace (except for secrets)
  if (normalizeWhitespace && !isSecret) {
    // Replace NBSP and other whitespace variants with regular space
    result = result.replace(/[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000]/g, ' ');
    // Collapse multiple spaces/tabs to single space
    result = result.replace(/\s+/g, ' ');
  }
  
  // 5. Case normalization
  if (toLowerCase) {
    result = result.toLowerCase();
  }
  
  return result;
}
