# Next.js Basic Registration Example

This example demonstrates how to use the AllFactors SDK with Next.js to track user signups after registration.

## Overview

This example shows:
- A user registration form in Next.js
- Server-side API route handling the registration
- Reading AllFactors tracking cookies (`af_usr` and `af_ses`) from the HTTP request
- Using the AllFactors SDK to track signups after successful user registration

## Prerequisites

Before using this example, ensure:
1. The AllFactors client-side tracking script is installed on your website
2. The tracking script sets the `af_usr` and `af_ses` cookies in the user's browser
3. These cookies are sent with HTTP requests to your API routes

## Setup

1. Install dependencies:
```bash
npm install allfactors next react react-dom
npm install --save-dev @types/node @types/react typescript
```

2. Set up environment variables in `.env.local`:
```env
ALLFACTORS_DOMAIN=your-domain
ALLFACTORS_ACCESS_KEY=your-access-key
ALLFACTORS_SECRET_KEY=your-secret-key
```

3. Add the AllFactors client-side tracking script to your pages (in `_app.tsx` or `_document.tsx`):
```tsx
<script src="https://cdn.allfactors.com/tracker.js" data-domain="your-domain"></script>
```

4. Run the development server:
```bash
npm run dev
```

## File Structure

```
.
├── pages/
│   ├── api/
│   │   └── register.ts          # API route for registration
│   └── register.tsx               # Registration form page
├── .env.local                     # Environment variables (not committed)
├── package.json
└── tsconfig.json
```

## How It Works

1. **Client-side tracking script loads** (on page load)
   - AllFactors tracking script sets `af_usr` and `af_ses` cookies
   - These cookies identify the user and session

2. **User submits the registration form** (`pages/register.tsx`)
   - Form collects email, password, and other user details
   - Form is submitted to `/api/register` endpoint
   - Browser automatically sends cookies with the request

3. **Server processes registration** (`pages/api/register.ts`)
   - Validates user input
   - Creates user account in your database
   - **Reads `af_usr` and `af_ses` from HTTP cookies** (not generated)

4. **Track signup with AllFactors**
   - If cookies are present, the SDK sends the signup event
   - Links the server-side event to the client-side tracking session

## Important Notes

- **Do not generate random values** for `af_usr` and `af_ses` - these must be read from cookies
- The cookies are set by the AllFactors client-side tracking script
- If the cookies are not present, the tracking will be skipped with a warning

## Code Examples

See the individual files in this directory for the complete implementation.
