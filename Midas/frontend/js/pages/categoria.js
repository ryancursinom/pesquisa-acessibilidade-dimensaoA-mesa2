import { createAuctionCard } from '../components/auctionCard.js';
import { debounce, filterAuctions, sortAuctions } from '../components/auctionFilters.js';
import { syncBrandField } from '../components/catalogConfig.js';
import { clearElement } from '../components/dom.js';
import { getUserErrorMessage } from '../components/userError.js';
import { renderState } from '../components/statusMessage.js';
import { getAuctions, setFavorite } from '../services/auctionService.js';
import { normalizeCollection } from '../services/api.js';
import { t } from '../services/i18n.js';

const form = document.getElementById('category-filter-form');
const grid = document.getElementById('category-grid');
const title = document.getElementById('category-title');
const description = document.getElementById('category-description');
const summary = document.getElementById('category-result-summary');
const brandField = document.getElementById('filter-brand-field');
const brandInput = document.getElementById('filter-brand');
const category = new URLSearchParams(window.location.search).get('categoria') || 'Todos';
let auctions = [];

function getFilters() {
    const data = new FormData(form);
    return {
        search: data.get('search'),
        minPrice: data.get('minPrice'),
        maxPrice: data.get('maxPrice'),
        ending: data.get('ending'),
        sort: data.get('sort'),
        brand: data.get('brand'),
        category: category === 'Todos' ? 'all' : category
    };
}

function renderResults() {
    const filters = getFilters();
    const filtered = sortAuctions(filterAuctions(auctions, filters), filters.sort);
    clearElement(grid);
    summary.textContent = t('Itens encontrados: {count}', { count: filtered.length });
    if (!filtered.length) {
        renderState(grid, 'empty', t('Nenhum item corresponde aos filtros selecionados. Tente limpar alguns filtros.'));
        return;
    }
    filtered.forEach((auction) => grid.appendChild(createAuctionCard(auction, { showFavorite: true })));
}

async function toggleFavorite(button) {
    const auction = auctions.find((item) => String(item.id) === String(button.dataset.auctionId));
    if (!auction) return;
    button.disabled = true;
    try {
        await setFavorite(auction.id, !auction.isFavorite);
        auction.isFavorite = !auction.isFavorite;
        renderResults();
    } catch (error) {
        summary.textContent = getUserErrorMessage(error, t('Não conseguimos atualizar seus favoritos agora. Tente novamente em instantes.'));
    } finally {
        button.disabled = false;
    }
}

async function loadCategory() {
    const translatedCategory = category === 'Todos' ? t('Todas as categorias') : t(category);
    title.textContent = category === 'Todos' ? t('Catálogo de Leilões') : t('Catálogo de {category}', { category: translatedCategory });
    description.textContent = category === 'Todos'
        ? t('Explore os itens disponíveis em todas as categorias.')
        : t('Explore os itens disponíveis em {category}.', { category: translatedCategory });
    syncBrandField(category, brandField, brandInput);
    renderState(grid, 'loading', t('Carregando itens...'));
    try {
        auctions = normalizeCollection(await getAuctions());
        renderResults();
    } catch (error) {
        renderState(grid, 'error', getUserErrorMessage(error, t('Não conseguimos carregar os itens desta categoria agora. Tente novamente em instantes.')));
    }
}

form.addEventListener('input', debounce(renderResults));
form.addEventListener('change', renderResults);
form.addEventListener('reset', () => window.setTimeout(renderResults));
grid.addEventListener('click', (event) => {
    const favoriteButton = event.target.closest('[data-action="favorite"]');
    if (favoriteButton) toggleFavorite(favoriteButton);
});
loadCategory();
