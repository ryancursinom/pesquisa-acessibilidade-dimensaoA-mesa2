import { createAuctionCard } from '../components/auctionCard.js';
import { debounce, filterAuctions, sortAuctions } from '../components/auctionFilters.js';
import { categorySupportsBrand } from '../components/catalogConfig.js';
import { appendChildren, clearElement, createElement } from '../components/dom.js';
import { getUserErrorMessage } from '../components/userError.js';
import { renderState } from '../components/statusMessage.js';
import { getAuctions, setFavorite } from '../services/auctionService.js';
import { normalizeCollection } from '../services/api.js';
import { t } from '../services/i18n.js';

const form = document.getElementById('catalog-search-form');
const content = document.getElementById('catalog-content');
const status = document.getElementById('catalog-status');
const categorySelect = document.getElementById('catalog-category');
const brandField = document.getElementById('catalog-brand-field');
const brandInput = document.getElementById('catalog-brand');
let auctions = [];

function getFilters() {
    const data = new FormData(form);
    return {
        search: data.get('search'),
        sort: data.get('sort'),
        category: data.get('category'),
        minPrice: data.get('minPrice'),
        maxPrice: data.get('maxPrice'),
        ending: data.get('ending'),
        brand: data.get('brand')
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

function createCategoryHeader(category, count) {
    const header = createElement('header', { className: 'catalog-category-header' });
    const titleGroup = createElement('div', { className: 'catalog-category-title' });
    titleGroup.append(
        createElement('h2', { text: t(category) }),
        createElement('span', {
            className: 'catalog-category-count',
            text: t('Itens encontrados: {count}', { count })
        })
    );
    header.appendChild(titleGroup);
    return header;
}

function createCategoryAction(category) {
    const wrapper = createElement('div', { className: 'catalog-category-action' });
    const link = createElement('a', {
        className: 'btn-secondary catalog-category-link',
        text: t('Acessar categoria de {category}', { category: t(category) }),
        attrs: { href: `categoria.html?categoria=${encodeURIComponent(category)}` }
    });
    wrapper.appendChild(link);
    return wrapper;
}

function createCategoryBlock(category, items) {
    const section = createElement('section', { className: 'catalog-category-block' });
    const grid = createElement('div', { className: 'auctions-grid' });
    items.forEach((auction) => grid.appendChild(createAuctionCard(auction, { showFavorite: true })));
    appendChildren(section, [
        createCategoryHeader(category, items.length),
        grid,
        createCategoryAction(category)
    ]);
    return section;
}

function updateBrandVisibility() {
    const visible = categorySupportsBrand(categorySelect.value);
    brandField.hidden = !visible;
    if (!visible) brandInput.value = '';
}

function renderCatalog() {
    const filters = getFilters();
    const filtered = sortAuctions(filterAuctions(auctions, filters), filters.sort);
    clearElement(content);
    status.textContent = '';

    if (!filtered.length) {
        renderState(content, 'empty', t('Nenhum item corresponde aos filtros selecionados. Tente limpar alguns filtros.'));
        return;
    }

    groupByCategory(filtered).forEach((items, category) => {
        content.appendChild(createCategoryBlock(category, items));
    });
}

async function toggleFavorite(button) {
    const auction = auctions.find((item) => String(item.id) === String(button.dataset.auctionId));
    if (!auction) return;

    button.disabled = true;
    try {
        await setFavorite(auction.id, !auction.isFavorite);
        auction.isFavorite = !auction.isFavorite;
        renderCatalog();
        status.textContent = t(auction.isFavorite
            ? 'Leilão adicionado aos favoritos.'
            : 'Leilão removido dos favoritos.');
    } catch (error) {
        status.textContent = getUserErrorMessage(
            error,
            t('Não conseguimos atualizar seus favoritos agora. Tente novamente em instantes.')
        );
    } finally {
        button.disabled = false;
    }
}

async function loadCatalog() {
    renderState(content, 'loading', t('Carregando catálogo...'));
    try {
        auctions = normalizeCollection(await getAuctions());
        renderCatalog();
    } catch (error) {
        renderState(content, 'error', getUserErrorMessage(
            error,
            t('Não conseguimos carregar o catálogo agora. Tente novamente em instantes.')
        ));
        status.textContent = '';
    }
}

form.addEventListener('input', debounce(renderCatalog));
form.addEventListener('change', (event) => {
    if (event.target === categorySelect) updateBrandVisibility();
    renderCatalog();
});
form.addEventListener('reset', () => window.setTimeout(() => {
    updateBrandVisibility();
    renderCatalog();
}));
content.addEventListener('click', (event) => {
    const favoriteButton = event.target.closest('[data-action="favorite"]');
    if (favoriteButton) toggleFavorite(favoriteButton);
});

updateBrandVisibility();
loadCatalog();
