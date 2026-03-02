# AllFactors SDK Examples

This directory contains examples demonstrating how to integrate the AllFactors SDK with various frameworks and use cases.

## Available Examples

### [Next.js Basic Registration](./nextjs-basic-registration)
A complete example showing how to integrate AllFactors with a Next.js application using email/password registration.

**Features:**
- User registration form
- Server-side API route
- AllFactors signup tracking
- TypeScript support

[View Example →](./nextjs-basic-registration)

### [Next.js OAuth2 Registration](./nextjs-oauth-registration)
A complete example showing how to integrate AllFactors with a Next.js application using OAuth2 authentication providers.

**Features:**
- Google OAuth2 authentication
- GitHub OAuth2 authentication
- NextAuth.js integration
- AllFactors signup tracking
- TypeScript support

[View Example →](./nextjs-oauth-registration)

## Quick Start

Each example is a standalone project. To run an example:

1. Navigate to the example directory:
```bash
cd examples/nextjs-basic-registration
# or
cd examples/nextjs-oauth-registration
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Run the development server:
```bash
npm run dev
```

## Contributing

If you have an example you'd like to add, please submit a pull request!
