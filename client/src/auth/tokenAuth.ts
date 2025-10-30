export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

//--------------JWT  token functions-------------------
export function setTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}
export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/**
 * builds header for back end fetches that require auth
 */
export function getAuthHeader(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

//refresh token logic
//prototype handling here
//TODO implement this into the main router and error handler
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem(ACCESS_KEY, data.accessToken);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Refresh token failed:", err);
    clearTokens();
    return false;
  }
}

//if refresh token fails will this automatically send me to the login screen?
