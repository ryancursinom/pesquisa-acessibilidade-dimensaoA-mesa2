import { appendChildren, createElement, formatCurrency } from './dom.js';
import { createIcon } from './icons.js';
import { t } from '../services/i18n.js';

function formatTimeRemaining(auction) {
    if (auction.status === 'CLOSED') return t('Encerrado');
    if (auction.timeRemaining) return auction.timeRemaining;
    if (!auction.endsAt) return t('Em andamento');
    const remainingMs = new Date(auction.endsAt).getTime() - Date.now();
    if (remainingMs <= 0) return t('Encerrando');
    const totalHours = Math.ceil(remainingMs / 3600000);
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return days > 0 ? t('{days}d {hours}h', { days, hours }) : t('{hours}h', { hours });
}

function createFavoriteButton(auction) {
    const favorite = Boolean(auction.isFavorite);
    const button = createElement('button', {
        className: 'card-wishlist',
        attrs: {
            type: 'button',
            'aria-label': t(favorite ? 'Remover leilão dos favoritos' : 'Favoritar leilão'),
            'aria-pressed': String(favorite)
        },
        dataset: { action: 'favorite', auctionId: auction.id }
    });
    button.appendChild(createIcon('heart', { filled: favorite }));
    return button;
}

function createEditLink(auction, rootPath) {
    const link = createElement('a', {
        className: 'card-edit',
        attrs: {
            href: `${rootPath}/html/criar-leilao.html?id=${encodeURIComponent(auction.id)}`,
            'aria-label': t('Editar {title}', { title: auction.title })
        }
    });
    link.appendChild(createIcon('pencil'));
    return link;
}

function createMedia(auction, rootPath, options) {
    const media = createElement('div', { className: 'card-media' });
    const image = createElement('img', {
        className: 'card-image',
        attrs: {
            src: auction.imageUrl || `${rootPath}/assets/img/item-default.svg`,
            alt: auction.imageAlt || t('Imagem de {title}', { title: auction.title }),
            loading: 'lazy', decoding: 'async'
        }
    });
    const status = createElement('span', {
        className: `card-badge card-badge--${String(auction.status || 'active').toLowerCase()}`,
        text: t(auction.status === 'CLOSED' ? 'ENCERRADO' : 'AO VIVO')
    });
    const timer = createElement('span', { className: 'card-timer', text: formatTimeRemaining(auction) });
    appendChildren(media, [image, status, timer]);
    if (options.showFavorite) media.appendChild(createFavoriteButton(auction));
    if (options.showEdit) media.appendChild(createEditLink(auction, rootPath));
    return media;
}

function createCardAction(auction, rootPath, options) {
    const label = options.actionLabel || (auction.status === 'CLOSED' ? t('Ver Detalhes') : t('Ver leilão'));
    const href = options.actionHref || `${rootPath}/html/detalhes-leilao.html?id=${encodeURIComponent(auction.id)}`;
    return createElement('a', { className: 'btn-bid', text: label, attrs: { href } });
}

function createPriceInfo(auction) {
    const wrapper = createElement('div');
    const label = createElement('span', {
        className: 'bid-label', text: t(auction.status === 'CLOSED' ? 'Lance Final' : 'Lance Atual')
    });
    const price = createElement('strong', {
        className: 'bid-value', text: formatCurrency(auction.currentBid ?? auction.startingBid ?? 0)
    });
    wrapper.append(label, price);
    return wrapper;
}

function createBuyNowHint(auction) {
    if (!auction.buyNowPrice || auction.status === 'CLOSED') return null;
    return createElement('p', {
        className: 'card-buy-now-hint',
        text: t('Compra imediata disponível por {price}', { price: formatCurrency(auction.buyNowPrice) })
    });
}

function createContent(auction, rootPath, options) {
    const content = createElement('div', { className: 'card-content' });
    const category = createElement('span', { className: 'card-category', text: t(auction.category || 'Sem categoria') });
    const title = createElement('h3', { className: 'card-title', text: auction.title || t('Item sem nome') });
    const condition = createElement('p', { className: 'card-status', text: t(auction.condition || 'Estado não informado') });
    const priceRow = createElement('div', { className: 'card-bid-info' });
    priceRow.append(createPriceInfo(auction), createCardAction(auction, rootPath, options));
    const footer = createElement('div', { className: 'card-footer' });
    footer.appendChild(createElement('span', { text: t('Lances: {count}', { count: auction.bidCount || 0 }) }));
    appendChildren(content, [category, title, condition, createBuyNowHint(auction), priceRow, footer]);
    return content;
}

export function createAuctionCard(auction, options = {}) {
    const rootPath = document.body.dataset.root || '..';
    const article = createElement('article', { className: 'auction-card', dataset: { auctionId: auction.id } });
    appendChildren(article, [createMedia(auction, rootPath, options), createContent(auction, rootPath, options)]);
    return article;
}
