module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid token provided' });
    }

    const token = authHeader.substring(7);
    
    // Decode the token (in production, use proper JWT verification)
    let userData;
    try {
      userData = JSON.parse(Buffer.from(token, 'base64').toString());
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // Revoke the refresh token via Google's revoke endpoint
    if (userData.refreshToken) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${userData.refreshToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        console.log('Refresh token revoked successfully for user:', userData.email);
      } catch (error) {
        console.error('Failed to revoke refresh token:', error);
        // Continue with response even if revoke fails
      }
    }

    // In a real application, you would delete the user record from your database here
    // For now, we'll just log the disconnect
    console.log('User disconnected:', userData.email);

    res.status(200).json({ 
      success: true, 
      message: 'Google account disconnected successfully' 
    });

  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ 
      error: 'Failed to disconnect Google account' 
    });
  }
};


