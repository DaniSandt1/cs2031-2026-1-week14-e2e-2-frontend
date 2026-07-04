const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = rawApiBaseUrl || 'http://localhost:8080';
export const AUTH_TOKEN_KEY = 'uber-clone-token';
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';
