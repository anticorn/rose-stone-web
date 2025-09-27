# Rose Stone Backend

This is the backend API for the Rose Stone expense tracker application.

## Setup Instructions

### 1. Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Navigate to the backend directory**:
   ```bash
   cd backend-setup
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   - Follow the prompts to link to your Vercel account
   - Choose a project name (e.g., `rose-stone-backend`)
   - Deploy to production

### 2. Configure Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:
   - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret

### 3. Update Google OAuth Settings

In your Google Cloud Console:

1. Go to "APIs & Services" > "Credentials"
2. Edit your OAuth 2.0 Client
3. Add these authorized redirect URIs:
   - `https://your-vercel-app-name.vercel.app/api/auth/callback`
   - `https://anticorn.github.io/rose-stone-web/` (for your frontend)

### 4. Update Frontend URL

After deployment, update your frontend to use the correct backend URL:

1. Find your Vercel app URL (e.g., `https://rose-stone-backend-abc123.vercel.app`)
2. Update the frontend code to use this URL instead of `https://rose-stone-backend.vercel.app`

## API Endpoints

- `GET /api/auth/start` - Start Google OAuth flow
- `GET /api/auth/callback` - Handle OAuth callback
- `POST /api/auth/disconnect` - Disconnect Google account
- `GET /api/drive/list` - List Google Drive files

## Testing

You can test the endpoints using curl:

```bash
# Test auth start
curl "https://your-app.vercel.app/api/auth/start?returnUrl=https://anticorn.github.io/rose-stone-web/"

# Test drive list (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" "https://your-app.vercel.app/api/drive/list"
```

## Troubleshooting

- **404 Error**: Make sure the app is deployed and the URL is correct
- **CORS Issues**: The backend includes CORS headers for cross-origin requests
- **Token Issues**: Make sure environment variables are set correctly
- **Google OAuth Issues**: Verify redirect URIs match exactly


