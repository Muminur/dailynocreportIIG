/**
 * Token Refresh Utilities
 * 
 * Handles automatic refresh of Microsoft OAuth tokens
 */

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Refresh the Microsoft OAuth access token
 * @param refreshToken - The refresh token from Microsoft
 * @returns New access token and expiry
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
  try {
    const tenantId = process.env.AZURE_AD_TENANT_ID;
    const clientId = process.env.AZURE_AD_CLIENT_ID;
    const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;

    if (!tenantId || !clientId || !clientSecret) {
      throw new Error('Missing Azure AD configuration');
    }

    const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        scope: 'openid profile email User.Read Mail.Read offline_access',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // Use new refresh token if provided
      expiresAt: Date.now() + data.expires_in * 1000,
    };
  } catch (error) {
    console.error('Error in refreshAccessToken:', error);
    throw error;
  }
}

/**
 * Check if token is expired or about to expire
 * @param expiresAt - The token expiry timestamp
 * @param bufferSeconds - Refresh buffer in seconds (default: 300 = 5 minutes)
 * @returns True if token needs refresh
 */
export function isTokenExpired(expiresAt: number, bufferSeconds: number = 300): boolean {
  const bufferMs = bufferSeconds * 1000;
  return Date.now() >= expiresAt - bufferMs;
}

