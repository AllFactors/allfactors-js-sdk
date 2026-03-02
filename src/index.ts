import axios, { AxiosInstance, AxiosProxyConfig } from 'axios';
import crypto from 'crypto';
import { version } from '../package.json';

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

export class AllFactors {
  private accessKey: string;
  private secretKey: string;
  private domain: string;
  private httpClient: AxiosInstance;
  private baseUrl: string = 'https://sdk-events.allfactors.com';

  constructor(domain: string, accessKey: string, secretKey: string, config?: AllFactorsConfig) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.domain = domain;

    const axiosConfig: any = {
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `allfactors-js-sdk/${version}`,
      },
    };

    if (config?.proxy) {
      const proxyConfig: AxiosProxyConfig = {
        host: config.proxy.host,
        port: config.proxy.port,
        protocol: config.proxy.protocol,
      };

      if (config.proxy.auth) {
        proxyConfig.auth = {
          username: config.proxy.auth.username,
          password: config.proxy.auth.password,
        };
      }

      axiosConfig.proxy = proxyConfig;
    }

    this.httpClient = axios.create(axiosConfig);
  }

  async validate(): Promise<void> {
    try {
      const ts = Date.now();
      const payload = { access_key: this.accessKey, ts };
      const signature = this.createHmacSignature(payload);

      const response = await this.httpClient.post(`/api/v1/validate/${this.domain}`, {
        ...payload,
        signature,
      });

      if (response.data?.status !== 'ok') {
        throw new Error(`AllFactors validation failed: unexpected response from server`);
      }
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

  async send_signup(email: string, type: 'oauth' | 'form', hostname: string, path: string, af_usr: string, af_ses: string): Promise<any> {
    try {
      const ts = Date.now();
      const payload = {
        event: {
          type,
          email,
          hostname,
          path,
          af_usr,
          af_ses,
          ts,
          access_key: this.accessKey,
        }
      };

      const signature = this.createHmacSignature(payload);

      const response = await this.httpClient.post(`/api/v1/signup/${this.domain}/`, {
        ...payload,
        signature,
      });

      return response.data;
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
