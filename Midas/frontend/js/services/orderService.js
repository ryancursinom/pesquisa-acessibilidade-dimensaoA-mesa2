import { apiRequest } from './api.js';

export function checkoutCart(payload) {
    return apiRequest('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export function checkoutWonAuction(auctionId, payload) {
    return apiRequest(`/auctions/${encodeURIComponent(auctionId)}/checkout`, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}
