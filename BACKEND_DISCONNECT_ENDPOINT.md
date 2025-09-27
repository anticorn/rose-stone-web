# Backend Disconnect Google Endpoint Implementation

## Frontend Implementation

The frontend now calls this endpoint when the user clicks "Disconnect Google":

```javascript
// Frontend call (already implemented)
await fetch('https://rose-stone-backend.vercel.app/api/auth/disconnect', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
});
```

## Backend Endpoint Implementation

You need to implement this endpoint in your `rose-stone-backend.vercel.app`:

### Endpoint: `POST /api/auth/disconnect`

```javascript
// Example implementation for your backend
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the token and get user info
    const user = await verifyToken(token); // Your token verification function
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get the refresh token from your database
    const userRecord = await getUserFromDatabase(user.id); // Your DB function
    
    if (userRecord && userRecord.refreshToken) {
      // Revoke the refresh token via Google's revoke endpoint
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${userRecord.refreshToken}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        console.log('Refresh token revoked successfully');
      } catch (error) {
        console.error('Failed to revoke refresh token:', error);
        // Continue with DB cleanup even if revoke fails
      }
    }

    // Delete the user record from your database
    await deleteUserFromDatabase(user.id); // Your DB function
    
    // Return success response
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
}
```

### Required Database Functions

You'll need these database functions in your backend:

```javascript
// Get user record from database
async function getUserFromDatabase(userId) {
  // Implementation depends on your database
  // Should return user object with refreshToken field
}

// Delete user record from database
async function deleteUserFromDatabase(userId) {
  // Implementation depends on your database
  // Should remove the user's record completely
}

// Verify JWT token
async function verifyToken(token) {
  // Implementation depends on your JWT setup
  // Should return user object if valid, null if invalid
}
```

### Google OAuth Revoke Endpoint

The Google OAuth revoke endpoint:
- **URL**: `https://oauth2.googleapis.com/revoke?token=<refresh_token>`
- **Method**: POST
- **Content-Type**: `application/x-www-form-urlencoded`
- **Response**: 200 OK on success

### Frontend Behavior

When the disconnect button is clicked:

1. **Calls backend**: `POST /api/auth/disconnect` with Bearer token
2. **Backend revokes**: Refresh token via Google's revoke endpoint
3. **Backend deletes**: User record from database
4. **Frontend clears**: Local storage and UI state
5. **User sees**: Disconnected state with "Sign in with Google" button

### Error Handling

The frontend handles these scenarios:
- ✅ **Backend call succeeds**: User is fully disconnected
- ✅ **Backend call fails**: User is still disconnected locally (graceful degradation)
- ✅ **Network error**: User is still disconnected locally
- ✅ **Invalid token**: User is still disconnected locally

### Security Notes

- Always verify the token before processing
- Use HTTPS for all requests
- Log disconnect events for audit purposes
- Consider rate limiting the disconnect endpoint
- The refresh token should be the one stored during initial OAuth flow

This implementation ensures complete disconnection from Google services and proper cleanup of user data.


