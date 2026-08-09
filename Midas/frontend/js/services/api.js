const DEFAULT_API_BASE_URL = 'http://localhost:8080/api';
const REQUEST_TIMEOUT_MS = 10000;

export class ApiError extends Error {
    constructor(message, status = 0, details = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

function getApiBaseUrl() {
    return localStorage.getItem('midas-api-base-url') || DEFAULT_API_BASE_URL;
}

function getAuthToken() {
    return localStorage.getItem('midas-auth-token');
}

function buildHeaders(customHeaders = {}, body) {
    const headers = new Headers(customHeaders);
    const token = getAuthToken();

    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (body && !(body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    headers.set('Accept', 'application/json');
    return headers;
}

async function parseResponse(response) {
    if (response.status === 204) return null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    return response.text();
}

function normalizeErrorPayload(payload, fallback) {
    if (payload && typeof payload === 'object') {
        return payload.message || payload.error || fallback;
    }
    return typeof payload === 'string' && payload.trim() ? payload : fallback;
}

export async function apiRequest(path, options = {}) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const url = `${getApiBaseUrl()}${path}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: buildHeaders(options.headers, options.body),
            signal: controller.signal
        });
        const payload = await parseResponse(response);

        if (!response.ok) {
            const message = normalizeErrorPayload(payload, 'Não foi possível concluir a solicitação.');
            throw new ApiError(message, response.status, payload);
        }

        return payload;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        if (error.name === 'AbortError') {
            throw new ApiError('A solicitação demorou demais. Tente novamente.', 408);
        }
        throw new ApiError('Não foi possível conectar ao servidor. Verifique se a API está disponível.');
    } finally {
        window.clearTimeout(timeoutId);
    }
}

export function buildQuery(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') query.set(key, value);
    });
    const serialized = query.toString();
    return serialized ? `?${serialized}` : '';
}

export function normalizeCollection(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
}
