import type { NextApiRequest, NextApiResponse } from 'next';
import AllFactors from 'allfactors';
import { parseCookies } from '../../../lib/cookies';

type TrackSignupRequest = {
  email: string;
};

type TrackSignupResponse = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TrackSignupResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email }: TrackSignupRequest = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Read AllFactors tracking cookies from the request
    // These cookies are set by the AllFactors client-side tracking script
    const cookies = parseCookies(req);
    const af_usr = cookies['af_usr'];
    const af_ses = cookies['af_ses'];

    if (af_usr && af_ses) {
      const allfactors = new AllFactors(
        process.env.ALLFACTORS_DOMAIN!,
        process.env.ALLFACTORS_ACCESS_KEY!,
        process.env.ALLFACTORS_SECRET_KEY!
      );

      try {
        await allfactors.send_signup(email, 'oauth', 'app.example.com', '/register', af_usr, af_ses);
        console.log(`Signup tracked successfully for ${email}`);
      } catch (error) {
        console.error('Failed to track signup in AllFactors:', error);
      }
    } else {
      console.warn('AllFactors tracking cookies (af_usr, af_ses) not found. Ensure the AllFactors client-side script is loaded.');
    }

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Track signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
