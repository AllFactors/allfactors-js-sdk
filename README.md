# allfactors

JS / TypeScript server-side SDK for AllFactors Analytics

## Installation

```bash
npm install allfactors
```

## Usage

### TypeScript (Next.js)

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import AllFactors from 'allfactors';

const allfactors = new AllFactors('your-domain', 'your-access-key', 'your-secret-key');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;

  // ... your registration logic ...

  // af_usr and af_ses are set by the AllFactors client-side tracking script
  const af_usr = req.cookies['af_usr'];
  const af_ses = req.cookies['af_ses'];

  if (af_usr && af_ses) {
    try {
      await allfactors.send_signup(email, 'form', req.headers.host!, req.url!, af_usr, af_ses);
    } catch (error) {
      console.error('AllFactors tracking failed:', error);
    }
  }

  res.status(201).json({ success: true });
}
```

### JavaScript / CommonJS (Express)

```javascript
const AllFactors = require('allfactors').default;

const allfactors = new AllFactors('your-domain', 'your-access-key', 'your-secret-key');

app.post('/register', async (req, res) => {
  const { email } = req.body;

  // ... your registration logic ...

  // af_usr and af_ses are set by the AllFactors client-side tracking script
  const af_usr = req.cookies['af_usr'];
  const af_ses = req.cookies['af_ses'];

  if (af_usr && af_ses) {
    try {
      await allfactors.send_signup(email, 'form', req.hostname, req.path, af_usr, af_ses);
    } catch (error) {
      console.error('AllFactors tracking failed:', error);
    }
  }

  res.status(201).json({ success: true });
});
```

### With Proxy Configuration

```typescript
import AllFactors from 'allfactors';

const allfactors = new AllFactors('your-domain', 'your-access-key', 'your-secret-key', {
  proxy: {
    host: 'proxy.example.com',
    port: 8080,
    protocol: 'http',
    auth: {
      username: 'proxy-user',
      password: 'proxy-password'
    }
  }
});

// Use the SDK as normal
await allfactors.send_signup('user@example.com', 'form', 'app.example.com', '/path/of/user/signup/page', getCookie(request, 'af_usr'), getCookie(request, 'af_ses'));
```

## API

### Constructor

```typescript
new AllFactors(domain: string, accessKey: string, secretKey: string, config?: AllFactorsConfig)
```

**Parameters:**
- `domain` (string): Your AllFactors domain
- `accessKey` (string): Your AllFactors access key
- `secretKey` (string): Your AllFactors secret key
- `config` (optional object): Configuration options
  - `proxy` (optional object): Proxy server configuration
    - `host` (string): Proxy server hostname
    - `port` (number): Proxy server port
    - `protocol` (optional string): Proxy protocol (http/https)
    - `auth` (optional object): Proxy authentication
      - `username` (string): Proxy username
      - `password` (string): Proxy password

### Methods

#### send_signup(email, type, hostname, path, af_usr, af_ses)

Sends a signup event to AllFactors.

**Parameters:**
- `email` (string): User email address
- `type` (string): Signup type - either `'oauth'` or `'form'`
- `hostname` (string): The hostname that the signup occured on
- `path` (string): The path of the page that the signup occured on
- `af_usr` (string): AllFactors user identifier (read from the `af_usr` HTTP cookie)
- `af_ses` (string): AllFactors session identifier (read from the `af_ses` HTTP cookie)

**Important:** The `af_usr` and `af_ses` parameters should be read from HTTP cookies set by the AllFactors client-side tracking script. Do not generate random values for these parameters.

**Returns:** Promise that resolves with the API response

## Examples

### Next.js Integration

We provide comprehensive examples for integrating AllFactors with Next.js applications:

#### Basic Registration Example
See [examples/nextjs-basic-registration](examples/nextjs-basic-registration) for a complete example showing:
- User registration form with email/password
- Server-side API route handling
- AllFactors SDK integration for tracking signups

#### OAuth2 Registration Example
See [examples/nextjs-oauth-registration](examples/nextjs-oauth-registration) for a complete example showing:
- OAuth2 authentication with Google and GitHub
- NextAuth.js integration
- AllFactors SDK integration for tracking OAuth signups

Each example includes:
- Full source code
- Setup instructions
- Environment variable configuration
- Detailed documentation

## Development

### Building

```bash
npm run build
```

This will compile the TypeScript code to JavaScript in the `dist/` directory.

## License

MIT
