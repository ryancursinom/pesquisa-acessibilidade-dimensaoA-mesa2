import { UserFacingError } from '../components/userError.js';
import { t } from './i18n.js';

const API_BASE_URL = 'http://localhost:8080/api';
const REQUEST_TIMEOUT_MS = 10000;

export class ApiError extends UserFacingError {
    constructor(message, status = 0, details = null) {
        super(message, status, details);
        this.name = 'ApiError';
    }
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

function getStatusMessage(status) {
    const messages = {
        400: 'Revise os dados informados e tente novamente.',
        401: 'Sua sessão expirou ou seus dados de acesso não foram aceitos. Entre novamente.',
        403: 'Você não tem permissão para realizar esta ação.',
        404: 'Não encontramos o conteúdo solicitado. Atualize a página ou tente novamente.',
        409: 'Esta ação não pode ser concluída porque os dados mudaram. Atualize a página e tente novamente.',
        422: 'Alguns dados precisam ser corrigidos antes de continuar.',
        429: 'Muitas tentativas foram feitas em pouco tempo. Aguarde um momento e tente novamente.'
    };
    if (messages[status]) return t(messages[status]);
    if (status >= 500) return t('Algo deu errado do nosso lado. Tente novamente em instantes.');
    return t('Não conseguimos concluir esta ação agora. Tente novamente em instantes.');
}

export async function apiRequest(path, options = {}) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const url = `${API_BASE_URL}${path}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: buildHeaders(options.headers, options.body),
            signal: controller.signal
        });
        const payload = await parseResponse(response);
        if (!response.ok) throw new ApiError(getStatusMessage(response.status), response.status, payload);
        return payload;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        if (error.name === 'AbortError') {
            throw new ApiError(t('Esta ação está demorando mais que o esperado. Tente novamente.'), 408);
        }
        throw new ApiError(t('Não conseguimos concluir esta ação agora. Verifique sua conexão e tente novamente.'));
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
