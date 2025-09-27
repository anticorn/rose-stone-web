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

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: userData.accessToken,
      refresh_token: userData.refreshToken
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // List Google Sheets files
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name, mimeType, createdTime, modifiedTime)',
      orderBy: 'modifiedTime desc'
    });

    res.json({
      files: response.data.files || [],
      user: {
        id: userData.userId,
        email: userData.email,
        name: userData.name
      }
    });
  } catch (error) {
    console.error('Drive list error:', error);
    res.status(500).json({ error: 'Failed to list Google Drive files' });
  }
};


