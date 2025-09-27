# Google OAuth Setup Guide

## The Problem
You're getting a "400. That's an error" when trying to sign in with Google because the Google OAuth client ID is not configured.

## Solution: Set Up Google OAuth

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Rose Stone Expense Tracker"
4. Click "Create"

### Step 2: Enable Required APIs

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for and enable these APIs:
   - **Google Sheets API**
   - **Google Drive API**
   - **Google+ API** (for user profile information)

### Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields:
     - App name: "Rose Stone Expense Tracker"
     - User support email: your email
     - Developer contact: your email
   - Add scopes:
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/drive.file`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Add test users (your email and collaborators' emails)

4. Create OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "Rose Stone Web App"
   - Authorized JavaScript origins:
     - `https://anticorn.github.io`
     - `http://localhost:3000` (for local development)
   - Authorized redirect URIs:
     - `https://anticorn.github.io/rose-stone-web`
     - `http://localhost:3000` (for local development)

### Step 4: Get Your Credentials

1. After creating the OAuth client, you'll see a popup with your credentials
2. Copy the **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)

### Step 5: Configure Your App

1. In your project root, create a `.env` file:
   ```bash
   touch .env
   ```

2. Add your Google Client ID to the `.env` file:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your-actual-client-id-here
   ```

3. **Important**: Replace `your-actual-client-id-here` with your real Client ID from Step 4

### Step 6: Deploy the Updated App

1. Commit your changes:
   ```bash
   git add .env
   git commit -m "Add Google OAuth configuration"
   ```

2. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

## Important Notes

### Security
- **Never commit your `.env` file to Git** (it's already in `.gitignore`)
- The `.env` file is only for local development
- For production, you'll need to set environment variables in your hosting platform

### For GitHub Pages
Since GitHub Pages doesn't support environment variables, you have two options:

#### Option 1: Hardcode for Demo (Not Recommended for Production)
Temporarily hardcode the client ID in the code for demonstration purposes.

#### Option 2: Use a Different Hosting Platform
Consider using platforms that support environment variables:
- Vercel
- Netlify
- Heroku

### Testing Locally
1. Run `npm start` to test locally
2. The app should work with your Google OAuth configuration
3. Test the sign-in functionality

## Troubleshooting

### Common Issues

1. **"Client ID not configured"**
   - Make sure you created a `.env` file
   - Check that `REACT_APP_GOOGLE_CLIENT_ID` is set correctly
   - Restart your development server after adding the `.env` file

2. **"Invalid client"**
   - Check that your Client ID is correct
   - Verify the authorized origins include your domain

3. **"Access blocked"**
   - Make sure you added your email as a test user in OAuth consent screen
   - Check that the OAuth consent screen is properly configured

4. **"Redirect URI mismatch"**
   - Verify that your domain is added to authorized redirect URIs
   - Check for typos in the domain name

### Getting Help
- Check the browser console for detailed error messages
- Verify your Google Cloud Console configuration
- Make sure all required APIs are enabled

## Next Steps
Once OAuth is working:
1. Test the Google Drive integration
2. Set up your Google Sheets as described in `GOOGLE_SHEETS_SETUP.md`
3. Share sheets with collaborators
4. Test multi-user functionality

The app will work perfectly once the OAuth configuration is complete!


