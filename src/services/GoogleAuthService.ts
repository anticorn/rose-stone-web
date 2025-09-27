export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  initials: string;
  picture?: string;
}

export class GoogleAuthService {
  private currentUser: GoogleUser | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load gapi script if not already loaded
      if (typeof window !== 'undefined' && !window.gapi) {
        await this.loadGapiScript();
      }

      // Initialize gapi
      await new Promise<void>((resolve, reject) => {
        if (typeof window !== 'undefined' && window.gapi) {
          const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'demo-client-id';
          
          if (!clientId || clientId === 'your-client-id-here' || clientId === 'demo-client-id') {
            // For demo purposes, we'll simulate the auth flow
            console.warn('Using demo mode - Google OAuth not configured');
            this.isInitialized = true;
            resolve();
            return;
          }

          window.gapi.load('auth2', () => {
            window.gapi.auth2.init({
              client_id: clientId,
              scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
            }).then(() => {
              this.isInitialized = true;
              resolve();
            }).catch((error: any) => {
              console.error('Google Auth initialization failed:', error);
              reject(new Error('Failed to initialize Google Auth. Please check your Client ID configuration.'));
            });
          });
        } else {
          reject(new Error('GAPI not available'));
        }
      });
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
      throw error;
    }
  }

  private loadGapiScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window not available'));
        return;
      }

      // Load both gapi and gapi.client
      const script1 = document.createElement('script');
      script1.src = 'https://apis.google.com/js/api.js';
      
      const script2 = document.createElement('script');
      script2.src = 'https://apis.google.com/js/client.js';

      let loadedCount = 0;
      const onLoad = () => {
        loadedCount++;
        if (loadedCount === 2) {
          resolve();
        }
      };

      const onError = () => {
        reject(new Error('Failed to load Google API scripts'));
      };

      script1.onload = onLoad;
      script1.onerror = onError;
      script2.onload = onLoad;
      script2.onerror = onError;

      document.head.appendChild(script1);
      document.head.appendChild(script2);
    });
  }

  async signIn(): Promise<GoogleUser> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Check if we're in demo mode
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'demo-client-id';
      
      if (!clientId || clientId === 'your-client-id-here' || clientId === 'demo-client-id') {
        // Demo mode - create a mock user
        const mockUser: GoogleUser = {
          id: 'demo-user-' + Date.now(),
          email: 'demo@example.com',
          name: 'Demo User',
          initials: 'DU',
          picture: undefined
        };

        this.currentUser = mockUser;
        localStorage.setItem('roseStoneGoogleUser', JSON.stringify(mockUser));
        
        return mockUser;
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      const profile = user.getBasicProfile();
      const userInfo: GoogleUser = {
        id: profile.getId(),
        email: profile.getEmail(),
        name: profile.getName(),
        initials: this.generateInitials(profile.getName()),
        picture: profile.getImageUrl()
      };

      this.currentUser = userInfo;
      localStorage.setItem('roseStoneGoogleUser', JSON.stringify(userInfo));
      
      return userInfo;
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      
      this.currentUser = null;
      localStorage.removeItem('roseStoneGoogleUser');
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  }

  getCurrentUser(): GoogleUser | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to load from localStorage
    const savedUser = localStorage.getItem('roseStoneGoogleUser');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        return this.currentUser;
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('roseStoneGoogleUser');
      }
    }

    return null;
  }

  isSignedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  async getAccessToken(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Check if we're in demo mode
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'demo-client-id';
      
      if (!clientId || clientId === 'your-client-id-here' || clientId === 'demo-client-id') {
        // Demo mode - return a mock token
        return 'demo-access-token-' + Date.now();
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = authInstance.currentUser.get();
      const authResponse = user.getAuthResponse();
      return authResponse.access_token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      throw error;
    }
  }

  private generateInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3); // Max 3 characters
  }

  async refreshUserInfo(): Promise<GoogleUser | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = authInstance.currentUser.get();
      
      if (user.isSignedIn()) {
        const profile = user.getBasicProfile();
        const userInfo: GoogleUser = {
          id: profile.getId(),
          email: profile.getEmail(),
          name: profile.getName(),
          initials: this.generateInitials(profile.getName()),
          picture: profile.getImageUrl()
        };

        this.currentUser = userInfo;
        localStorage.setItem('roseStoneGoogleUser', JSON.stringify(userInfo));
        return userInfo;
      }

      return null;
    } catch (error) {
      console.error('Failed to refresh user info:', error);
      return null;
    }
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gapi: any;
  }
}

export const googleAuthService = new GoogleAuthService();
