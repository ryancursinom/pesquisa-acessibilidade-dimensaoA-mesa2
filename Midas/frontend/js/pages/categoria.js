import { createAuctionCard } from '../components/auctionCard.js';
import { debounce, filterAuctions, sortAuctions } from '../components/auctionFilters.js';
import { clearElement } from '../components/dom.js';
import { renderState } from '../components/statusMessage.js';
import { getAuctions, setFavorite } from '../services/auctionService.js';
import { normalizeCollection } from '../services/api.js';
import { addToCart } from '../services/cartService.js';

const form = document.getElementById('category-filter-form');
const grid = document.getElementById('category-grid');
const title = document.getElementById('category-title');
const description = document.getElementById('category-description');
const summary = document.getElementById('category-result-summary');
const category = new URLSearchParams(window.location.search).get('categoria') || 'Todos';
let auctions = [];

function getFilters() {
    const data = new FormData(form);
    return {
        search: data.get('search'),
        minPrice: data.get('minPrice'),
        maxPrice: data.get('maxPrice'),
        ending: data.get('ending'),
        brand: data.get('brand'),
        rarity: data.get('rarity'),
        itemId: data.get('itemId'),
        category: category === 'Todos' ? '' : category
    };
}

function renderResults() {
    const filtered = sortAuctions(filterAuctions(auctions, getFilters()), 'ending');
    clearElement(grid);
    summary.textContent = `${filtered.length} item(ns) encontrado(s).`;
    if (!filtered.length) {
        renderState(grid, 'empty', 'Nenhum item corresponde aos filtros selecionados.');
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
        summary.textContent = error.message;
    } finally {
        button.disabled = false;
    }
}

function addImmediateItem(id) {
    const auction = auctions.find((item) => String(item.id) === String(id));
    if (!auction) return;
    addToCart({ id: auction.id, title: auction.title, price: auction.price, imageUrl: auction.imageUrl, imageAlt: auction.imageAlt, category: auction.category });
    summary.textContent = `${auction.title} foi adicionado ao carrinho.`;
}

async function loadCategory() {
    title.textContent = category === 'Todos' ? 'Catálogo de Leilões' : `Catálogo de ${category}`;
    description.textContent = `Explore os itens disponíveis em ${category === 'Todos' ? 'todas as categorias' : category}.`;
    renderState(grid, 'loading', 'Carregando itens...');
    try {
        auctions = normalizeCollection(await getAuctions());
        renderResults();
    } catch (error) {
        renderState(grid, 'error', error.message);
    }
}

form.addEventListener('input', debounce(renderResults));
form.addEventListener('change', renderResults);
form.addEventListener('reset', () => window.setTimeout(renderResults));
grid.addEventListener('click', (event) => {
    const favoriteButton = event.target.closest('[data-action="favorite"]');
    const buyButton = event.target.closest('[data-action="buy-now"]');
    if (favoriteButton) toggleFavorite(favoriteButton);
    if (buyButton) addImmediateItem(buyButton.dataset.auctionId);
});

loadCategory();
