export const TOKEN_KEY = 'tracelm_token';

export function setToken(token: string) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
    }
}

export function getToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(TOKEN_KEY);
    }
    return null;
}

export function removeToken() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
    }
}

export function isAuthenticated(): boolean {
    return !!getToken();
}

export function getUserDetails(): { email: string, name: string } | null {
    const token = getToken();
    if (!token) return null;
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return {
            email: decoded.sub || 'User',
            name: decoded.name || decoded.sub?.split('@')[0] || 'User'
        };
    } catch (e) {
        return null;
    }
}
