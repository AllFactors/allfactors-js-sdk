import { ValidationError } from '../errors';
import { LIMITS } from './limits';

/**
 * Validates port: number, integer, in range 1–65535.
 * @throws ValidationError when validation fails
 */
export function validatePort(value: unknown, field: string = 'port'): void {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new ValidationError(`${field} must be an integer`, field);
  }
  if (value < LIMITS.PORT_MIN || value > LIMITS.PORT_MAX) {
    throw new ValidationError(
      `${field} must be a number between ${LIMITS.PORT_MIN} and ${LIMITS.PORT_MAX}`,
      field
    );
  }
}
