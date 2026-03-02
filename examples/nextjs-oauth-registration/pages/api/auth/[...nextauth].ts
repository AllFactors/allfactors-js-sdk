import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import crypto from 'crypto';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // This callback is called when a user signs in successfully
      if (user.email) {
        try {
          // Check if this is a new user signup (you would normally check your database)
          // For this example, we assume every OAuth sign-in is a new user
          // TODO: Replace this with actual database logic:
          // const existingUser = await db.users.findOne({ email: user.email });
          // const isNewUser = !existingUser;
          const isNewUser = true;

          if (isNewUser) {
            // Generate a user ID for your database (or use one from your database)
            const userId = user.id || crypto.randomUUID();
            
            // TODO: Save user to your database with the userId
            // await db.users.create({
            //   id: userId,
            //   email: user.email,
            //   name: user.name,
            //   image: user.image,
            //   provider: account?.provider,
            //   providerId: account?.providerAccountId,
            //   createdAt: new Date(),
            // });

            // Note: In NextAuth callbacks, we don't have direct access to the request object
            // to read cookies. For OAuth flows, you have two main options:
            //
            // Option 1 (Recommended): Track signup client-side after OAuth completes
            //   - After successful OAuth sign-in, make a client-side call to /api/track/signup
            //   - That endpoint will have access to the cookies
            //
            // Option 2: Use Next.js middleware to capture cookies during OAuth flow
            //   - Capture af_usr and af_ses in middleware
            //   - Store them temporarily (e.g., in session storage)
            //   - Retrieve them here
            
            console.log(
              'OAuth signup completed. Use client-side tracking or middleware to read ' +
              'af_usr and af_ses cookies and call /api/track/signup'
            );
          }
        } catch (error) {
          console.error('Error during sign in callback:', error);
          // Allow sign in to continue even if tracking fails
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // Add user ID to the token on initial sign in
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID to the session
      if (session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/register',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
