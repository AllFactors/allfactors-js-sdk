import axios, { AxiosInstance, AxiosProxyConfig } from 'axios';
import crypto from 'crypto';
import { version } from '../package.json';
import { validateConstructorArgs } from './validation/constructor';
import { validateSignupArgs } from './validation/signup';
export { ValidationError } from './errors';

export interface AllFactorsProxyConfig {
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
  protocol?: string;
}

export interface AllFactorsConfig {
  proxy?: AllFactorsProxyConfig;
}

export type ValidateResponse = { status: 'ok' } | { error: string };

export type SignupResponse =
  | { status: 'success'; message: string; domain: string; event_type: string }
  | { error: string };

export class AllFactors {
  private accessKey: string;
  private secretKey: string;
  private domain: string;
  private httpClient: AxiosInstance;
  private baseUrl: string = 'https://sdk-events.allfactors.com';

  constructor(domain: string, accessKey: string, secretKey: string, config?: AllFactorsConfig) {
    const sanitized = validateConstructorArgs(domain, accessKey, secretKey, config);
    this.accessKey = sanitized.accessKey;
    this.secretKey = sanitized.secretKey;
    this.domain = sanitized.domain;

    const axiosConfig: any = {
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `allfactors-js-sdk/${version}`,
      },
      timeout: 30000, // 30 second timeout
    };

    if (sanitized.config?.proxy) {
      const proxy = sanitized.config.proxy;
      const proxyConfig: AxiosProxyConfig = {
        host: proxy.host,
        port: proxy.port,
        protocol: proxy.protocol,
      };

      if (proxy.auth) {
        proxyConfig.auth = {
          username: proxy.auth.username,
          password: proxy.auth.password,
        };
      }

      axiosConfig.proxy = proxyConfig;
    }

    this.httpClient = axios.create(axiosConfig);
  }

  async validate(): Promise<ValidateResponse> {
    try {
      const ts = Date.now();
      const payload = { access_key: this.accessKey, ts };
      const signature = this.createHmacSignature(payload);

      const response = await this.httpClient.post(`/api/v1/validate/${this.domain}`, {
        ...payload,
        signature,
      });

      const data = response.data as ValidateResponse;

      if (!('status' in data) || data.status !== 'ok') {
        throw new Error(`AllFactors validation failed: unexpected response from server`);
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.error;
        throw new Error(
          `AllFactors validation failed: ${serverMessage || `${error.response?.status} - ${error.response?.statusText || error.message}`}`
        );
      }
      throw error;
    }
  }

  private createHmacSignature(data: object): string {
    const message = JSON.stringify(data);
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(message);
    return hmac.digest('hex');
  }

  async send_signup(email: string, type: 'oauth' | 'form', hostname: string, path: string, af_usr: string, af_ses: string): Promise<SignupResponse> {
    try {
      const sanitized = validateSignupArgs(email, type, hostname, path, af_usr, af_ses);
      const ts = Date.now();
      const payload = {
        event: {
          type: sanitized.type,
          email: sanitized.email,
          hostname: sanitized.hostname,
          path: sanitized.path,
          af_usr: sanitized.af_usr,
          af_ses: sanitized.af_ses,
          ts,
          access_key: this.accessKey,
        }
      };

      const signature = this.createHmacSignature(payload);

      const response = await this.httpClient.post(`/api/v1/signup/${this.domain}/`, {
        ...payload,
        signature,
      });

      return response.data as SignupResponse;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage = error.response?.data?.error;
        throw new Error(
          `AllFactors API Error: ${serverMessage || `${error.response?.status} - ${error.response?.statusText || error.message}`}`
        );
      }
      throw error;
    }
  }
}

export default AllFactors;
