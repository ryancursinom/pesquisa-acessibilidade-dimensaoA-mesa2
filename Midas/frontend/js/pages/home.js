import { createAuctionCard } from '../components/auctionCard.js';
import { appendChildren, clearElement, createElement } from '../components/dom.js';
import { getUserErrorMessage } from '../components/userError.js';
import { renderState } from '../components/statusMessage.js';
import { getAuctions, setFavorite } from '../services/auctionService.js';
import { normalizeCollection } from '../services/api.js';
import { t } from '../services/i18n.js';
import { isAuctionClosed } from '../components/auctionStatus.js';

const featuredGrid = document.getElementById('featured-grid');
const endingGrid = document.getElementById('ending-grid');
const categoriesGrid = document.getElementById('categories-grid');
const previousButton = document.querySelector('.carousel-control.prev');
const nextButton = document.querySelector('.carousel-control.next');
const homeStatus = document.getElementById('home-status');
let auctions = [];

function renderAuctionList(container, items, emptyMessage) {
    clearElement(container);
    if (!items.length) {
        renderState(container, 'empty', t(emptyMessage));
        return;
    }
    items.forEach((auction) => container.appendChild(createAuctionCard(auction, { showFavorite: true })));
}

function getFeatured(items) {
    return [...items]
        .filter((item) => !isAuctionClosed(item.status))
        .sort((a, b) => Number(b.currentBid || b.startingBid || 0) - Number(a.currentBid || a.startingBid || 0))
        .slice(0, 3);
}

function getEndingSoon(items) {
    return [...items]
        .filter((item) => !isAuctionClosed(item.status) && item.endsAt)
        .sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt))
        .slice(0, 8);
}

function getCategoryCounts(items) {
    return items.reduce((map, item) => {
        const category = item.category || 'Outros';
        map.set(category, (map.get(category) || 0) + 1);
        return map;
    }, new Map());
}

function renderCategories(items) {
    clearElement(categoriesGrid);
    const categories = [...getCategoryCounts(items).entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (!categories.length) {
        renderState(categoriesGrid, 'empty', t('As categorias aparecerão quando houver itens disponíveis.'));
        return;
    }
    categories.forEach(([category, count]) => {
        const card = createElement('article', { className: 'category-card' });
        appendChildren(card, [
            createElement('h3', { text: t(category) }),
            createElement('p', { text: t('Itens disponíveis: {count}', { count }) }),
            createElement('a', {
                text: t('Navegar na categoria'),
                attrs: { href: `html/categoria.html?categoria=${encodeURIComponent(category)}` }
            })
        ]);
        categoriesGrid.appendChild(card);
    });
}

function updateCarouselControls() {
    const maxScrollLeft = Math.max(0, endingGrid.scrollWidth - endingGrid.clientWidth);
    previousButton.disabled = endingGrid.scrollLeft <= 1;
    nextButton.disabled = endingGrid.scrollLeft >= maxScrollLeft - 1;
}

function renderHome() {
    renderAuctionList(featuredGrid, getFeatured(auctions), 'Nenhum leilão em destaque no momento.');
    renderAuctionList(endingGrid, getEndingSoon(auctions), 'Nenhum leilão próximo do encerramento.');
    renderCategories(auctions);
    updateCarouselControls();
}

function scrollCarousel(direction) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    endingGrid.scrollBy({ left: direction * 320, behavior: reducedMotion ? 'auto' : 'smooth' });
}

async function toggleFavorite(button) {
    const auction = auctions.find((item) => String(item.id) === String(button.dataset.auctionId));
    if (!auction) return;
    button.disabled = true;
    try {
        await setFavorite(auction.id, !auction.isFavorite);
        auction.isFavorite = !auction.isFavorite;
        renderHome();
        homeStatus.className = 'success-state';
        homeStatus.textContent = t(auction.isFavorite ? 'Leilão adicionado aos favoritos.' : 'Leilão removido dos favoritos.');
    } catch (error) {
        homeStatus.className = 'error-state';
        homeStatus.textContent = getUserErrorMessage(error, t('Não conseguimos atualizar seus favoritos agora. Tente novamente em instantes.'));
        button.disabled = false;
    }
}

async function loadHome() {
    renderState(featuredGrid, 'loading', t('Carregando leilões em destaque...'));
    renderState(endingGrid, 'loading', t('Carregando leilões próximos do encerramento...'));
    renderState(categoriesGrid, 'loading', t('Carregando categorias...'));
    try {
        auctions = normalizeCollection(await getAuctions());
        renderHome();
    } catch (error) {
        const message = getUserErrorMessage(error, t('Não conseguimos carregar os leilões agora. Tente novamente em instantes.'));
        renderState(featuredGrid, 'error', message);
        renderState(endingGrid, 'error', message);
        renderState(categoriesGrid, 'error', message);
    }
}

featuredGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="favorite"]');
    if (button) toggleFavorite(button);
});
endingGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="favorite"]');
    if (button) toggleFavorite(button);
});
previousButton.addEventListener('click', () => scrollCarousel(-1));
nextButton.addEventListener('click', () => scrollCarousel(1));
endingGrid.addEventListener('scroll', updateCarouselControls);
window.addEventListener('resize', updateCarouselControls);
loadHome();
