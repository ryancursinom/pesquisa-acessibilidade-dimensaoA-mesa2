import { createAuctionCard } from '../components/auctionCard.js';
import { debounce, filterAuctions, sortAuctions } from '../components/auctionFilters.js';
import { appendChildren, clearElement, createElement } from '../components/dom.js';
import { renderState } from '../components/statusMessage.js';
import { getAuctions, setFavorite } from '../services/auctionService.js';
import { normalizeCollection } from '../services/api.js';
import { addToCart } from '../services/cartService.js';

const form = document.getElementById('catalog-search-form');
const content = document.getElementById('catalog-content');
const summary = document.getElementById('catalog-result-summary');
let auctions = [];

function getFilters() {
    const data = new FormData(form);
    return {
        search: data.get('search'),
        sort: data.get('sort'),
        saleType: data.get('saleType'),
        status: data.get('status')
    };
}

function groupByCategory(items) {
    return items.reduce((groups, auction) => {
        const category = auction.category || 'Outros';
        if (!groups.has(category)) groups.set(category, []);
        groups.get(category).push(auction);
        return groups;
    }, new Map());
}

function createCategoryBlock(category, items) {
    const section = createElement('section', { className: 'catalog-category-block' });
    const header = createElement('header', { className: 'catalog-category-header' });
    const title = createElement('h2', { text: category });
    const link = createElement('a', {
        className: 'catalog-category-link',
        text: `Acessar categoria de ${category}`,
        attrs: { href: `categoria.html?categoria=${encodeURIComponent(category)}` }
    });
    const grid = createElement('div', { className: 'auctions-grid' });
    items.forEach((auction) => grid.appendChild(createAuctionCard(auction, { showFavorite: true })));
    appendChildren(header, [title, link]);
    appendChildren(section, [header, grid]);
    return section;
}

function renderCatalog() {
    const filters = getFilters();
    const filtered = sortAuctions(filterAuctions(auctions, filters), filters.sort);
    clearElement(content);
    summary.textContent = `${filtered.length} item(ns) encontrado(s).`;

    if (!filtered.length) {
        renderState(content, 'empty', 'Nenhum item corresponde aos filtros selecionados.');
        return;
    }

    groupByCategory(filtered).forEach((items, category) => {
        content.appendChild(createCategoryBlock(category, items));
    });
}

async function toggleFavorite(button) {
    const id = button.dataset.auctionId;
    const auction = auctions.find((item) => String(item.id) === String(id));
    if (!auction) return;
    const nextFavorite = !auction.isFavorite;
    button.disabled = true;
    try {
        await setFavorite(id, nextFavorite);
        auction.isFavorite = nextFavorite;
        renderCatalog();
    } catch (error) {
        summary.textContent = error.message;
    } finally {
        button.disabled = false;
    }
}

function addImmediateItem(id) {
    const auction = auctions.find((item) => String(item.id) === String(id));
    if (!auction) return;
    addToCart({
        id: auction.id,
        title: auction.title,
        price: auction.price,
        imageUrl: auction.imageUrl,
        imageAlt: auction.imageAlt,
        category: auction.category
    });
    summary.textContent = `${auction.title} foi adicionado ao carrinho.`;
}

async function loadCatalog() {
    renderState(content, 'loading', 'Carregando catálogo...');
    try {
        auctions = normalizeCollection(await getAuctions());
        renderCatalog();
    } catch (error) {
        renderState(content, 'error', error.message);
        summary.textContent = '';
    }
}

form.addEventListener('input', debounce(renderCatalog));
form.addEventListener('change', renderCatalog);
content.addEventListener('click', (event) => {
    const favoriteButton = event.target.closest('[data-action="favorite"]');
    const buyButton = event.target.closest('[data-action="buy-now"]');
    if (favoriteButton) toggleFavorite(favoriteButton);
    if (buyButton) addImmediateItem(buyButton.dataset.auctionId);
});

loadCatalog();
