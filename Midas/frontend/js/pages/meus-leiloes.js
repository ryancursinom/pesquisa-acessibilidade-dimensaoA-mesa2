import { createAuctionCard } from '../components/auctionCard.js';
import { debounce, filterAuctions, sortAuctions } from '../components/auctionFilters.js';
import { categorySupportsBrand } from '../components/catalogConfig.js';
import { clearElement } from '../components/dom.js';
import { getUserErrorMessage } from '../components/userError.js';
import { renderState } from '../components/statusMessage.js';
import { getCreatedAuctions, getFavoriteAuctions, getMyBidAuctions, setFavorite } from '../services/auctionService.js';
import { normalizeCollection } from '../services/api.js';
import { t } from '../services/i18n.js';
import { isAuctionClosed } from '../components/auctionStatus.js';

const form = document.getElementById('my-auctions-filter-form');
const grid = document.getElementById('my-auctions-grid');
const count = document.getElementById('my-auctions-count');
const title = document.getElementById('my-auctions-title');
const description = document.getElementById('my-auctions-description');
const createButton = document.getElementById('my-create-auction');
const categorySelect = document.getElementById('my-category');
const brandField = document.getElementById('my-brand-field');
const brandInput = document.getElementById('my-brand');
const requestedTab = new URLSearchParams(window.location.search).get('aba') || 'favoritos';
let auctions = [];

const tabConfig = {
    favoritos: {
        tabId: 'tab-favorites', title: 'Leilões Favoritados',
        description: 'Aqui você acompanha todos os itens que marcou como favoritos.', loader: getFavoriteAuctions
    },
    criados: {
        tabId: 'tab-created', title: 'Meus Leilões',
        description: 'Aqui você acompanha os leilões que publicou, abertos ou encerrados.', loader: getCreatedAuctions
    },
    lances: {
        tabId: 'tab-bids', title: 'Leilões com Seus Lances',
        description: 'Aqui você acompanha os leilões em que já participou com algum lance.', loader: getMyBidAuctions
    }
};

const currentTab = tabConfig[requestedTab] ? requestedTab : 'favoritos';

function getActiveConfig() {
    return tabConfig[currentTab] || tabConfig.favoritos;
}

function markActiveTab() {
    const config = getActiveConfig();
    document.getElementById(config.tabId).setAttribute('aria-current', 'page');
    title.textContent = t(config.title);
    description.textContent = t(config.description);
    createButton.hidden = currentTab !== 'criados';
}

function getFilters() {
    const data = new FormData(form);
    return {
        minPrice: data.get('minPrice'), maxPrice: data.get('maxPrice'), ending: data.get('ending'),
        brand: data.get('brand'), category: data.get('category')
    };
}

function updateBrandVisibility() {
    const visible = categorySupportsBrand(categorySelect.value);
    brandField.hidden = !visible;
    if (!visible) brandInput.value = '';
}

function getCardOptions(auction) {
    if (currentTab === 'favoritos') return { showFavorite: true };
    if (currentTab === 'criados') {
        return {
            showEdit: true, actionLabel: t('Ver Lances'),
            actionHref: `detalhes-leilao.html?id=${encodeURIComponent(auction.id)}&owner=1`
        };
    }
    if (isAuctionClosed(auction.status) && auction.canCheckout) {
        return {
            actionLabel: t('Finalizar compra'),
            actionHref: `checkout.html?auctionId=${encodeURIComponent(auction.id)}`
        };
    }
    return {
        actionLabel: t(isAuctionClosed(auction.status) ? 'Ver resultado' : 'Ver leilão'),
        actionHref: `detalhes-leilao.html?id=${encodeURIComponent(auction.id)}`
    };
}

function renderResults() {
    const filtered = sortAuctions(filterAuctions(auctions, getFilters()), 'ending');
    clearElement(grid);
    count.textContent = t('Itens nesta aba: {count}', { count: filtered.length });
    if (!filtered.length) {
        renderState(grid, 'empty', t('Nenhum item corresponde aos filtros selecionados. Tente limpar alguns filtros.'));
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
        count.textContent = getUserErrorMessage(error, t('Não conseguimos remover este favorito agora. Tente novamente em instantes.'));
    } finally {
        button.disabled = false;
    }
}

async function loadAuctions() {
    const config = getActiveConfig();
    markActiveTab();
    updateBrandVisibility();
    renderState(grid, 'loading', t('Carregando seus leilões...'));
    try {
        auctions = normalizeCollection(await config.loader());
        renderResults();
    } catch (error) {
        renderState(grid, 'error', getUserErrorMessage(error, t('Não conseguimos carregar seus leilões agora. Tente novamente em instantes.')));
        count.textContent = '';
    }
}

form.addEventListener('input', debounce(renderResults));
form.addEventListener('change', (event) => {
    if (event.target === categorySelect) updateBrandVisibility();
    renderResults();
});
form.addEventListener('reset', () => window.setTimeout(() => {
    updateBrandVisibility(); renderResults();
}));
grid.addEventListener('click', (event) => {
    const favoriteButton = event.target.closest('[data-action="favorite"]');
    if (favoriteButton) toggleFavorite(favoriteButton);
});
loadAuctions();
