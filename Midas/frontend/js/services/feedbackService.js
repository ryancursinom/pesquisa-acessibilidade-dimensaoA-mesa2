import { enviarRequisicaoApi } from './api.js';

export function enviarAvaliacao(payload) {
    return enviarRequisicaoApi('/feedback', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export function obterAvaliacoesEmDestaque() {
    return enviarRequisicaoApi('/feedback/highlights');
}
