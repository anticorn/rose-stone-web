const { google } = require('googleapis');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${req.headers.origin || 'https://anticorn.github.io'}/rose-stone-web/`
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Generate a simple JWT-like token (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify({
      userId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token
    })).toString('base64');

    const returnUrl = state || 'https://anticorn.github.io/rose-stone-web/';
    
    // Redirect back to frontend with token
    res.redirect(`${returnUrl}#token=${token}`);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).json({ error: 'Failed to complete authentication' });
  }
};


