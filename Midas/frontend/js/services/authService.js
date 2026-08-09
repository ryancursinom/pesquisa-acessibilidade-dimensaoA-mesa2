import { UserFacingError } from '../components/userError.js';
import { apiRequest } from './api.js';
import { t } from './i18n.js';

const TOKEN_KEY = 'midas-auth-token';

function saveToken(payload) {
    const token = payload?.token || payload?.accessToken;
    if (!token) throw new UserFacingError(t('Não conseguimos concluir o acesso à sua conta. Tente entrar novamente.'));
    localStorage.setItem(TOKEN_KEY, token);
}

export async function login(credentials) {
    const payload = await apiRequest('/auth/login', {
        method: 'POST', body: JSON.stringify(credentials)
    });
    saveToken(payload);
    return payload;
}

export async function register(userData) {
    const payload = await apiRequest('/auth/register', {
        method: 'POST', body: JSON.stringify(userData)
    });
    if (payload?.token || payload?.accessToken) saveToken(payload);
    return payload;
}

export function logout() {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new CustomEvent('midas:auth-changed'));
}

export function isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
}
