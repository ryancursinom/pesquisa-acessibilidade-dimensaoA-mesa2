import { enviarRequisicaoApi, montarParametrosConsulta } from './api.js';

export function obterLeiloes(params = {}) {
    return enviarRequisicaoApi(`/auctions${montarParametrosConsulta(params)}`);
}

export function obterLeilaoPorId(id) {
    return enviarRequisicaoApi(`/auctions/${encodeURIComponent(id)}`);
}

export function obterHistoricoLances(id) {
    return enviarRequisicaoApi(`/auctions/${encodeURIComponent(id)}/bids`);
}

export function enviarLance(id, amount) {
    return enviarRequisicaoApi(`/auctions/${encodeURIComponent(id)}/bids`, {
        method: 'POST', body: JSON.stringify({ amount })
    });
}

export function comprarLeilaoAgora(id) {
    return enviarRequisicaoApi(`/auctions/${encodeURIComponent(id)}/buy-now`, { method: 'POST' });
}

export function definirFavorito(id, favorite) {
    return enviarRequisicaoApi(`/auctions/${encodeURIComponent(id)}/favorite`, {
        method: favorite ? 'POST' : 'DELETE'
    });
}

export function criarLeilao(formData) {
    return enviarRequisicaoApi('/auctions', { method: 'POST', body: formData });
}

export function atualizarLeilao(id, formData) {
    return enviarRequisicaoApi(`/auctions/${encodeURIComponent(id)}`, { method: 'PUT', body: formData });
}

export function obterLeiloesFavoritos() {
    return enviarRequisicaoApi('/users/me/favorites');
}

export function obterLeiloesComMeusLances() {
    return enviarRequisicaoApi('/users/me/bids');
}

export function obterLeiloesCriados() {
    return enviarRequisicaoApi('/users/me/auctions');
}
