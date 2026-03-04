import { ValidationError } from '../errors';
import { validateEmail } from './email';
import { validateHostname } from './hostname';
import { validateString } from './strings';
import { validatePath } from './urlpath';
import { LIMITS } from './limits';

const VALID_TYPES = ['oauth', 'form'] as const;

function validateType(value: unknown): 'oauth' | 'form' {
  if (typeof value !== 'string' || !(VALID_TYPES as readonly string[]).includes(value)) {
    throw new ValidationError(`type must be 'oauth' or 'form'`, 'type');
  }
  return value as 'oauth' | 'form';
}

export interface SanitizedSignupArgs {
  email: string;
  type: 'oauth' | 'form';
  hostname: string;
  path: string;
  af_usr: string;
  af_ses: string;
}

/**
 * Validates all arguments for send_signup(email, hostname, af_usr, af_ses).
 * Returns sanitized values.
 * @returns Sanitized signup arguments
 * @throws ValidationError when any validation fails
 */
export function validateSignupArgs(
  email: unknown,
  type: unknown,
  hostname: unknown,
  path: unknown,
  af_usr: unknown,
  af_ses: unknown
): SanitizedSignupArgs {
  return {
    email: validateEmail(email, 'email'),
    type: validateType(type),
    hostname: validateHostname(hostname, 'hostname'),
    path: validatePath(path),
    af_usr: validateString(af_usr, {
      field: 'af_usr',
      allowEmpty: false,
      maxLength: LIMITS.AF_USR_LENGTH,
      minLength: LIMITS.AF_USR_LENGTH
    }),
    af_ses: validateString(af_ses, {
      field: 'af_ses',
      allowEmpty: false,
      maxLength: LIMITS.AF_SES_LENGTH,
      minLength: LIMITS.AF_SES_LENGTH
    }),
  };
}
