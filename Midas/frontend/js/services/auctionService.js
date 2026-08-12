import { apiRequest, buildQuery } from './api.js';

export function getAuctions(params = {}) {
    return apiRequest(`/auctions${buildQuery(params)}`);
}

export function getAuctionById(id) {
    return apiRequest(`/auctions/${encodeURIComponent(id)}`);
}

export function getBidHistory(id) {
    return apiRequest(`/auctions/${encodeURIComponent(id)}/bids`);
}

export function placeBid(id, amount) {
    return apiRequest(`/auctions/${encodeURIComponent(id)}/bids`, {
        method: 'POST', body: JSON.stringify({ amount })
    });
}

export function buyNowAuction(id) {
    return apiRequest(`/auctions/${encodeURIComponent(id)}/buy-now`, { method: 'POST' });
}

export function setFavorite(id, favorite) {
    return apiRequest(`/auctions/${encodeURIComponent(id)}/favorite`, {
        method: favorite ? 'POST' : 'DELETE'
    });
}

export function createAuction(formData) {
    return apiRequest('/auctions', { method: 'POST', body: formData });
}

export function updateAuction(id, formData) {
    return apiRequest(`/auctions/${encodeURIComponent(id)}`, { method: 'PUT', body: formData });
}

export function getFavoriteAuctions() {
    return apiRequest('/users/me/favorites');
}

export function getMyBidAuctions() {
    return apiRequest('/users/me/bids');
}

export function getCreatedAuctions() {
    return apiRequest('/users/me/auctions');
}
