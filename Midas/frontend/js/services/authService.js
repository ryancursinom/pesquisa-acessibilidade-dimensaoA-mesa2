import { UserFacingError } from '../components/userError.js';
import { enviarRequisicaoApi } from './api.js';
import { traduzir } from './i18n.js';

const TOKEN_KEY = 'midas-auth-token';

function salvarToken(payload) {
    const token = payload?.token || payload?.accessToken;
    if (!token) throw new UserFacingError(traduzir('Não conseguimos concluir o acesso à sua conta. Tente entrar novamente.'));
    localStorage.setItem(TOKEN_KEY, token);
}

export async function autenticarUsuario(credentials) {
    const payload = await enviarRequisicaoApi('/auth/login', {
        method: 'POST', body: JSON.stringify(credentials)
    });
    salvarToken(payload);
    return payload;
}

export async function cadastrarUsuario(userData) {
    const payload = await enviarRequisicaoApi('/auth/register', {
        method: 'POST', body: JSON.stringify(userData)
    });
    if (payload?.token || payload?.accessToken) salvarToken(payload);
    return payload;
}

export function encerrarSessao() {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new CustomEvent('midas:auth-changed'));
}

export function verificarAutenticacao() {
    return Boolean(localStorage.getItem(TOKEN_KEY)?.trim());
}
