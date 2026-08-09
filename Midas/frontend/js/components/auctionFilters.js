function normalize(value) {
    return String(value || '').trim().toLocaleLowerCase('pt-BR');
}

function getComparablePrice(auction) {
    return Number(auction.saleType === 'BUY_NOW' ? auction.price : auction.currentBid || 0);
}

function matchesText(auction, term) {
    if (!term) return true;
    return [auction.title, auction.category, auction.brand, auction.description]
        .some((value) => normalize(value).includes(normalize(term)));
}

function matchesEnding(auction, endingHours) {
    if (!endingHours || endingHours === 'all' || !auction.endsAt) return true;
    const remainingMs = new Date(auction.endsAt).getTime() - Date.now();
    return remainingMs >= 0 && remainingMs <= Number(endingHours) * 60 * 60 * 1000;
}

export function filterAuctions(auctions, filters = {}) {
    return auctions.filter((auction) => {
        const price = getComparablePrice(auction);
        if (!matchesText(auction, filters.search)) return false;
        if (filters.minPrice && price < Number(filters.minPrice)) return false;
        if (filters.maxPrice && price > Number(filters.maxPrice)) return false;
        if (filters.brand && !normalize(auction.brand).includes(normalize(filters.brand))) return false;
        if (filters.rarity && !normalize(auction.rarity).includes(normalize(filters.rarity))) return false;
        if (filters.itemId && !normalize(auction.id).includes(normalize(filters.itemId))) return false;
        if (filters.category && !normalize(auction.category).includes(normalize(filters.category))) return false;
        if (filters.saleType && filters.saleType !== 'all' && auction.saleType !== filters.saleType) return false;
        if (filters.status && filters.status !== 'all' && auction.status !== filters.status) return false;
        return matchesEnding(auction, filters.ending);
    });
}

export function sortAuctions(auctions, sort = 'ending') {
    const items = [...auctions];
    const comparators = {
        'price-asc': (a, b) => getComparablePrice(a) - getComparablePrice(b),
        'price-desc': (a, b) => getComparablePrice(b) - getComparablePrice(a),
        title: (a, b) => String(a.title).localeCompare(String(b.title), 'pt-BR'),
        ending: (a, b) => new Date(a.endsAt || 8640000000000000) - new Date(b.endsAt || 8640000000000000)
    };
    return items.sort(comparators[sort] || comparators.ending);
}

export function debounce(callback, delay = 300) {
    let timeoutId;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => callback(...args), delay);
    };
}
