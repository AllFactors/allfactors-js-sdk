import { ValidationError } from '../errors';
import { validateString } from './strings';
import { validatePort } from './numbers';
import { LIMITS } from './limits';

const ALLOWED_PROTOCOLS = ['http', 'https'] as const;

interface ProxyLike {
  host: string;
  port: number;
  protocol?: string;
  auth?: { username: string; password: string };
}

export interface SanitizedConstructorArgs {
  domain: string;
  accessKey: string;
  secretKey: string;
  config?: {
    proxy?: {
      host: string;
      port: number;
      protocol?: string;
      auth?: {
        username: string;
        password: string;
      };
    };
  };
}

/**
 * Validates constructor arguments and optional proxy config.
 * Secrets-safe: accessKey, secretKey, proxy.auth values are never included in error messages.
 * Returns sanitized values.
 * @returns Sanitized constructor arguments
 * @throws ValidationError when any validation fails
 */
export function validateConstructorArgs(
  domain: unknown,
  accessKey: unknown,
  secretKey: unknown,
  config?: unknown
): SanitizedConstructorArgs {
  const sanitizedDomain = validateString(domain, {
    field: 'domain',
    allowEmpty: false,
    maxLength: LIMITS.DOMAIN_MAX_LENGTH,
  });
  const sanitizedAccessKey = validateString(accessKey, {
    field: 'accessKey',
    allowEmpty: false,
    maxLength: LIMITS.ACCESS_KEY_MAX_LENGTH,
    secret: true,
  });
  const sanitizedSecretKey = validateString(secretKey, {
    field: 'secretKey',
    allowEmpty: false,
    maxLength: LIMITS.SECRET_KEY_MAX_LENGTH,
    secret: true,
  });

  if (config === undefined || config === null) {
    return {
      domain: sanitizedDomain,
      accessKey: sanitizedAccessKey,
      secretKey: sanitizedSecretKey,
    };
  }
  if (typeof config !== 'object') {
    throw new ValidationError('config must be an object', 'config');
  }

  const cfg = config as { proxy?: ProxyLike };
  if (!cfg.proxy) {
    return {
      domain: sanitizedDomain,
      accessKey: sanitizedAccessKey,
      secretKey: sanitizedSecretKey,
    };
  }

  const proxy = cfg.proxy;
  const sanitizedHost = validateString(proxy.host, {
    field: 'proxy.host',
    allowEmpty: false,
    maxLength: LIMITS.PROXY_HOST_MAX_LENGTH,
  });
  validatePort(proxy.port, 'proxy.port');

  let sanitizedProtocol: string | undefined;
  if (proxy.protocol !== undefined && proxy.protocol !== null) {
    if (typeof proxy.protocol !== 'string') {
      throw new ValidationError('proxy.protocol must be a string', 'proxy.protocol');
    }
    const p = proxy.protocol.toLowerCase();
    if (!ALLOWED_PROTOCOLS.includes(p as typeof ALLOWED_PROTOCOLS[number])) {
      throw new ValidationError(
        'proxy.protocol must be one of: http, https',
        'proxy.protocol'
      );
    }
    sanitizedProtocol = p;
  }

  let sanitizedAuth: { username: string; password: string } | undefined;
  if (proxy.auth) {
    const sanitizedUsername = validateString(proxy.auth.username, {
      field: 'proxy.auth.username',
      allowEmpty: false,
      maxLength: LIMITS.PROXY_AUTH_STRING_MAX_LENGTH,
      secret: true,
    });
    const sanitizedPassword = validateString(proxy.auth.password, {
      field: 'proxy.auth.password',
      allowEmpty: false,
      maxLength: LIMITS.PROXY_AUTH_STRING_MAX_LENGTH,
      secret: true,
    });
    sanitizedAuth = {
      username: sanitizedUsername,
      password: sanitizedPassword,
    };
  }

  return {
    domain: sanitizedDomain,
    accessKey: sanitizedAccessKey,
    secretKey: sanitizedSecretKey,
    config: {
      proxy: {
        host: sanitizedHost,
        port: proxy.port,
        protocol: sanitizedProtocol,
        auth: sanitizedAuth,
      },
    },
  };
}
