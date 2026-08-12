import { enviarRequisicaoApi } from './api.js';

export function finalizarCompraCarrinho(payload) {
    return enviarRequisicaoApi('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export function finalizarCompraLeilaoVencido(auctionId, payload) {
    return enviarRequisicaoApi(`/auctions/${encodeURIComponent(auctionId)}/checkout`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}
