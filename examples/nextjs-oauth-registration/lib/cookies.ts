import type { NextApiRequest } from 'next';

/**
 * Parse cookies from a Next.js API request
 * @param req - The Next.js API request object
 * @returns Object with cookie names as keys and values as decoded strings
 */
export function parseCookies(req: NextApiRequest): Record<string, string> {
  const cookies: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;
  
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.split('=');
      const value = rest.join('=').trim();
      if (name) {
        cookies[name.trim()] = decodeURIComponent(value);
      }
    });
  }
  
  return cookies;
}
