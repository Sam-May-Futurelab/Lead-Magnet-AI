// API helper for Capacitor apps
// In browser: /api/* works because Vercel routes it
// In Capacitor: We need to use the full production URL to inkfluenceai.com

import { Capacitor } from '@capacitor/core';

const API_BASE_URL = 'https://www.inkfluenceai.com';

/**
 * Get the correct API URL based on platform
 * - Browser/Web: Use relative path (Vercel handles routing)
 * - Capacitor (iOS/Android): Use absolute URL to production API
 */
export function getApiUrl(path: string): string {
    // Ensure path starts with /api
    const apiPath = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;

    const isNative = Capacitor.isNativePlatform();
    const finalUrl = isNative ? `${API_BASE_URL}${apiPath}` : apiPath;

    console.log('[API] getApiUrl:', path, '->', finalUrl, '(native:', isNative, ')');

    return finalUrl;
}

/**
 * Wrapper for fetch that automatically uses correct API URL
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
    const url = getApiUrl(path);
    return fetch(url, options);
}
