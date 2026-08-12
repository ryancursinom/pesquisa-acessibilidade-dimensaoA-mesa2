import { verificarAutenticacao } from '../services/authService.js';

const PRIVATE_PAGES = new Set([
    'perfil.html',
    'meus-leiloes.html',
    'criar-leilao.html'
]);

function obterDestinoAtual() {
    const page = window.location.pathname.split('/').pop();
    if (!PRIVATE_PAGES.has(page)) return 'perfil.html';
    return `${page}${window.location.search}${window.location.hash}`;
}

function redirecionarParaPaginaEntrada() {
    document.body.setAttribute('data-private-page', '');
    const redirect = encodeURIComponent(obterDestinoAtual());
    window.location.replace(`login.html?redirect=${redirect}`);
}

export function exigirAutenticacao() {
    if (!verificarAutenticacao()) {
        redirecionarParaPaginaEntrada();
        return false;
    }

    document.body.removeAttribute('data-private-page');
    window.addEventListener('pagehide', () => {
        document.body.setAttribute('data-private-page', '');
    });
    window.addEventListener('pageshow', () => {
        if (!verificarAutenticacao()) {
            redirecionarParaPaginaEntrada();
            return;
        }
        document.body.removeAttribute('data-private-page');
    });
    return true;
}
