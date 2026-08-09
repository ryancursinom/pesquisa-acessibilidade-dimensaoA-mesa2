import { appendChildren, createElement, formatCurrency } from './dom.js';

function formatTimeRemaining(auction) {
    if (auction.status === 'CLOSED') return 'Encerrado';
    if (auction.timeRemaining) return auction.timeRemaining;
    if (!auction.endsAt) return 'Em andamento';
    const remainingMs = new Date(auction.endsAt).getTime() - Date.now();
    if (remainingMs <= 0) return 'Encerrando';
    const totalHours = Math.ceil(remainingMs / 3600000);
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

function createMedia(auction, rootPath, options) {
    const media = createElement('div', { className: 'card-media' });
    const image = createElement('img', {
        className: 'card-image',
        attrs: {
            src: auction.imageUrl || `${rootPath}/assets/img/item-default.svg`,
            alt: auction.imageAlt || `Imagem de ${auction.title}`,
            loading: 'lazy',
            decoding: 'async'
        }
    });
    const status = createElement('span', {
        className: `card-badge card-badge--${String(auction.status || 'active').toLowerCase()}`,
        text: auction.status === 'CLOSED' ? 'ENCERRADO' : 'AO VIVO'
    });
    const timer = createElement('span', {
        className: 'card-timer',
        text: formatTimeRemaining(auction)
    });

    appendChildren(media, [image, status, timer]);
    if (options.showFavorite) media.appendChild(createFavoriteButton(auction));
    if (options.showEdit) media.appendChild(createEditLink(auction, rootPath));
    return media;
}

function createFavoriteButton(auction) {
    return createElement('button', {
        className: 'card-wishlist',
        text: auction.isFavorite ? '♥' : '♡',
        attrs: {
            type: 'button',
            'aria-label': auction.isFavorite ? 'Remover leilão dos favoritos' : 'Favoritar leilão',
            'aria-pressed': String(Boolean(auction.isFavorite))
        },
        dataset: { action: 'favorite', auctionId: auction.id }
    });
}

function createEditLink(auction, rootPath) {
    return createElement('a', {
        className: 'card-edit',
        text: '✎',
        attrs: {
            href: `${rootPath}/html/criar-leilao.html?id=${encodeURIComponent(auction.id)}`,
            'aria-label': `Editar ${auction.title}`
        }
    });
}

function createCardAction(auction, rootPath, options) {
    const defaultLabel = auction.saleType === 'BUY_NOW' ? 'Comprar Agora' : 'Fazer Lance';
    const label = options.actionLabel || (auction.status === 'CLOSED' ? 'Ver Detalhes' : defaultLabel);
    if (options.actionHref) {
        return createElement('a', { className: 'btn-bid', text: label, attrs: { href: options.actionHref } });
    }
    if (auction.status === 'CLOSED') {
        return createElement('a', {
            className: 'btn-bid', text: label,
            attrs: { href: `${rootPath}/html/detalhes-leilao.html?id=${encodeURIComponent(auction.id)}` }
        });
    }
    if (auction.saleType === 'BUY_NOW') {
        return createElement('button', {
            className: 'btn-bid', text: label, attrs: { type: 'button' },
            dataset: { action: 'buy-now', auctionId: auction.id }
        });
    }
    return createElement('a', {
        className: 'btn-bid', text: label,
        attrs: { href: `${rootPath}/html/detalhes-leilao.html?id=${encodeURIComponent(auction.id)}` }
    });
}

function createContent(auction, rootPath, options) {
    const content = createElement('div', { className: 'card-content' });
    const category = createElement('span', { className: 'card-category', text: auction.category || 'Sem categoria' });
    const title = createElement('h3', { className: 'card-title', text: auction.title || 'Item sem nome' });
    const condition = createElement('p', { className: 'card-status', text: auction.condition || 'Estado não informado' });
    const priceRow = createElement('div', { className: 'card-bid-info' });
    const priceInfo = createElement('div');
    const priceLabel = createElement('span', {
        className: 'bid-label',
        text: auction.saleType === 'BUY_NOW' ? 'Preço' : auction.status === 'CLOSED' ? 'Lance Final' : 'Lance Atual'
    });
    const price = createElement('strong', {
        className: 'bid-value',
        text: formatCurrency(auction.saleType === 'BUY_NOW' ? auction.price : auction.currentBid)
    });
    appendChildren(priceInfo, [priceLabel, price]);
    appendChildren(priceRow, [priceInfo, createCardAction(auction, rootPath, options)]);
    const footer = createElement('div', { className: 'card-footer' });
    footer.appendChild(createElement('span', { text: `${auction.bidCount || 0} lances` }));
    appendChildren(content, [category, title, condition, priceRow, footer]);
    return content;
}

export function createAuctionCard(auction, options = {}) {
    const rootPath = document.body.dataset.root || '..';
    const article = createElement('article', { className: 'auction-card', dataset: { auctionId: auction.id } });
    appendChildren(article, [createMedia(auction, rootPath, options), createContent(auction, rootPath, options)]);
    return article;
}
