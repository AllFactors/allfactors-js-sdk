# Next.js OAuth2 Registration Example

This example demonstrates how to use the AllFactors SDK with Next.js to track user signups using OAuth2 providers (Google and GitHub).

## Overview

This example shows:
- OAuth2 authentication flow with Google and GitHub
- Reading AllFactors tracking cookies (`af_usr` and `af_ses`) from HTTP requests
- Using the AllFactors SDK to track signups after successful OAuth registration

## Features

- **Google OAuth2**: Sign up with Google
- **GitHub OAuth2**: Sign up with GitHub
- **AllFactors Integration**: Signup tracking after successful OAuth authentication

## Prerequisites

Before using this example, ensure:
1. The AllFactors client-side tracking script is installed on your website
2. The tracking script sets the `af_usr` and `af_ses` cookies in the user's browser
3. These cookies are sent with HTTP requests to your API routes

## Setup

1. Install dependencies:
```bash
npm install allfactors next react react-dom next-auth
npm install --save-dev @types/node @types/react typescript
```

2. Configure OAuth providers:

### Google OAuth Setup
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select an existing one
- Enable Google+ API
- Create OAuth 2.0 credentials
- Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- Copy your Client ID and Client Secret

### GitHub OAuth Setup
- Go to [GitHub Developer Settings](https://github.com/settings/developers)
- Create a new OAuth App
- Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
- Copy your Client ID and Client Secret

3. Set up environment variables in `.env.local`:
```env
# AllFactors Configuration
ALLFACTORS_DOMAIN=your-domain
ALLFACTORS_ACCESS_KEY=your-access-key
ALLFACTORS_SECRET_KEY=your-secret-key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

4. Add the AllFactors client-side tracking script to your pages (in `_app.tsx` or `_document.tsx`):
```tsx
<script src="https://cdn.allfactors.com/tracker.js" data-domain="your-domain"></script>
```

5. Run the development server:
```bash
npm run dev
```

## File Structure

```
.
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth].ts    # NextAuth configuration
│   │   └── track/
│   │       └── signup.ts           # Signup tracking endpoint
│   ├── _app.tsx                    # App wrapper with SessionProvider
│   └── register.tsx                 # Registration page with OAuth buttons
├── .env.local                       # Environment variables (not committed)
├── .env.example                     # Example environment variables
├── package.json
└── tsconfig.json
```

## How It Works

1. **Client-side tracking script loads** (on page load)
   - AllFactors tracking script sets `af_usr` and `af_ses` cookies
   - These cookies identify the user and session

2. **User clicks OAuth provider button** (`pages/register.tsx`)
   - User selects Google or GitHub to sign up
   - Redirected to provider's OAuth consent screen

3. **OAuth provider authenticates user**
   - User grants permission to the app
   - Provider redirects back to app with authorization code

4. **NextAuth handles callback** (`pages/api/auth/[...nextauth].ts`)
   - Exchanges authorization code for access token
   - Retrieves user profile information
   - Creates or updates user in database

5. **Track signup with AllFactors** (`pages/api/track/signup.ts`)
   - After successful OAuth registration, call the `/api/track/signup` endpoint
   - **Reads `af_usr` and `af_ses` from HTTP cookies** (not generated)
   - Links the server-side event to the client-side tracking session

## Important Notes

- **Do not generate random values** for `af_usr` and `af_ses` - these must be read from cookies
- The cookies are set by the AllFactors client-side tracking script
- For OAuth flows, you may need to track signups in a separate API call after the OAuth callback completes
- Use the provided `/api/track/signup` endpoint as a reference

## Alternative Approaches for OAuth Tracking

Since NextAuth callbacks don't have direct access to the original request cookies, you have a few options:

1. **Client-side tracking**: After successful OAuth sign-in, make a client-side call to `/api/track/signup` which will have the cookies
2. **Middleware**: Use Next.js middleware to capture cookies during the OAuth flow
3. **State parameter**: Pass cookie values through the OAuth state parameter (less secure)

The recommended approach is option 1 - client-side tracking after OAuth completion.

## Security Notes

- Always use HTTPS in production
- Keep your OAuth client secrets secure
- Use environment variables for sensitive data
- Implement CSRF protection (NextAuth handles this automatically)

## Code Examples

See the individual files in this directory for the complete implementation.
