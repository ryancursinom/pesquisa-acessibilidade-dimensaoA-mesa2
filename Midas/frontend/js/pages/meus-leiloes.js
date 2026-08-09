import { createAuctionCard } from '../components/auctionCard.js';
import { debounce, filterAuctions, sortAuctions } from '../components/auctionFilters.js';
import { clearElement } from '../components/dom.js';
import { renderState } from '../components/statusMessage.js';
import { getCreatedAuctions, getFavoriteAuctions, getMyBidAuctions, setFavorite } from '../services/auctionService.js';
import { normalizeCollection } from '../services/api.js';

const form = document.getElementById('my-auctions-filter-form');
const grid = document.getElementById('my-auctions-grid');
const count = document.getElementById('my-auctions-count');
const title = document.getElementById('my-auctions-title');
const description = document.getElementById('my-auctions-description');
const currentTab = new URLSearchParams(window.location.search).get('aba') || 'favoritos';
let auctions = [];

const tabConfig = {
    favoritos: {
        tabId: 'tab-favorites',
        title: 'Leilões Favoritados',
        description: 'Aqui você acompanha todos os itens que marcou como favoritos.',
        loader: getFavoriteAuctions
    },
    criados: {
        tabId: 'tab-created',
        title: 'Meus Leilões',
        description: 'Aqui você acompanha os leilões que publicou, abertos ou encerrados.',
        loader: getCreatedAuctions
    },
    lances: {
        tabId: 'tab-bids',
        title: 'Leilões com Seus Lances',
        description: 'Aqui você acompanha os leilões em que já participou com algum lance.',
        loader: getMyBidAuctions
    }
};

function getActiveConfig() {
    return tabConfig[currentTab] || tabConfig.favoritos;
}

function markActiveTab() {
    const config = getActiveConfig();
    document.getElementById(config.tabId).setAttribute('aria-current', 'page');
    title.textContent = config.title;
    description.textContent = config.description;
}

function getFilters() {
    const data = new FormData(form);
    return {
        minPrice: data.get('minPrice'),
        maxPrice: data.get('maxPrice'),
        ending: data.get('ending'),
        brand: data.get('brand'),
        itemId: data.get('itemId'),
        category: data.get('category')
    };
}

function getCardOptions(auction) {
    if (currentTab === 'favoritos') return { showFavorite: true };
    if (currentTab === 'criados') {
        return {
            showEdit: true,
            actionLabel: 'Ver Lances',
            actionHref: `detalhes-leilao.html?id=${encodeURIComponent(auction.id)}`
        };
    }
    if (auction.status === 'CLOSED' && auction.canCheckout) {
        return {
            actionLabel: 'Finalizar compra',
            actionHref: `checkout.html?auctionId=${encodeURIComponent(auction.id)}`
        };
    }
    return {
        actionLabel: auction.status === 'CLOSED' ? 'Ver resultado' : 'Ver leilão',
        actionHref: `detalhes-leilao.html?id=${encodeURIComponent(auction.id)}`
    };
}

function renderResults() {
    const filtered = sortAuctions(filterAuctions(auctions, getFilters()), 'ending');
    clearElement(grid);
    count.textContent = `${filtered.length} item(ns) nesta aba.`;
    if (!filtered.length) {
        renderState(grid, 'empty', 'Nenhum item corresponde aos filtros selecionados.');
        return;
    }
    filtered.forEach((auction) => grid.appendChild(createAuctionCard(auction, getCardOptions(auction))));
}

async function toggleFavorite(button) {
    const auction = auctions.find((item) => String(item.id) === String(button.dataset.auctionId));
    if (!auction) return;
    button.disabled = true;
    try {
        await setFavorite(auction.id, false);
        auctions = auctions.filter((item) => String(item.id) !== String(auction.id));
        renderResults();
    } catch (error) {
        count.textContent = error.message;
    } finally {
        button.disabled = false;
    }
}

async function loadAuctions() {
    const config = getActiveConfig();
    markActiveTab();
    renderState(grid, 'loading', 'Carregando seus leilões...');
    try {
        auctions = normalizeCollection(await config.loader());
        renderResults();
    } catch (error) {
        renderState(grid, 'error', error.message);
        count.textContent = '';
    }
}

form.addEventListener('input', debounce(renderResults));
form.addEventListener('change', renderResults);
form.addEventListener('reset', () => window.setTimeout(renderResults));
grid.addEventListener('click', (event) => {
    const favoriteButton = event.target.closest('[data-action="favorite"]');
    if (favoriteButton) toggleFavorite(favoriteButton);
});
loadAuctions();
