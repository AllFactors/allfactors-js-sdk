import type { NextApiRequest, NextApiResponse } from 'next';
import AllFactors from 'allfactors';
import crypto from 'crypto';
import { parseCookies } from '../../lib/cookies';

type RegistrationRequest = {
  email: string;
  password: string;
  name: string;
};

type RegistrationResponse = {
  success: boolean;
  message: string;
  userId?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegistrationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password, name }: RegistrationRequest = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    // TODO: Check if user already exists in your database
    // const existingUser = await db.users.findOne({ email });
    // if (existingUser) {
    //   return res.status(409).json({
    //     success: false,
    //     message: 'User already exists',
    //   });
    // }

    // Generate a unique user ID for your database
    const userId = crypto.randomUUID();

    // TODO: Hash the password before storing
    // const hashedPassword = await bcrypt.hash(password, 10);

    // TODO: Create user in your database
    // await db.users.create({
    //   id: userId,
    //   email,
    //   password: hashedPassword,
    //   name,
    //   createdAt: new Date(),
    // });

    // Read AllFactors tracking cookies from the request
    // These cookies (af_usr and af_ses) are set by the AllFactors client-side tracking script
    const cookies = parseCookies(req);
    const af_usr = cookies['af_usr'];
    const af_ses = cookies['af_ses'];

    // Track the signup event with AllFactors if cookies are present
    if (af_usr && af_ses) {
      const allfactors = new AllFactors(
        process.env.ALLFACTORS_DOMAIN!,
        process.env.ALLFACTORS_ACCESS_KEY!,
        process.env.ALLFACTORS_SECRET_KEY!
      );

      try {
        // Pass the cookie values to send_signup (NOT the userId from your database)
        await allfactors.send_signup(email, 'form', 'app.example.com', '/register', af_usr, af_ses);
        console.log('Signup tracked successfully in AllFactors');
      } catch (error) {
        // Log the error but don't fail the registration
        console.error('Failed to track signup in AllFactors:', error);
      }
    } else {
      console.warn('AllFactors tracking cookies (af_usr, af_ses) not found in request');
    }

    // Return success response with the userId from your database
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      userId,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
