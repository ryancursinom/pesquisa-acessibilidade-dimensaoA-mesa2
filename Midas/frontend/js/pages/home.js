import { createAuctionCard } from '../components/auctionCard.js';
import { appendChildren, clearElement, createElement } from '../components/dom.js';
import { renderState } from '../components/statusMessage.js';
import { getAuctions, setFavorite } from '../services/auctionService.js';
import { normalizeCollection } from '../services/api.js';
import { addToCart } from '../services/cartService.js';

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
        renderState(container, 'empty', emptyMessage);
        return;
    }
    items.forEach((auction) => container.appendChild(createAuctionCard(auction, { showFavorite: true })));
}

function getFeatured(items) {
    return [...items]
        .filter((item) => item.status !== 'CLOSED')
        .sort((a, b) => Number(b.currentBid || b.price || 0) - Number(a.currentBid || a.price || 0))
        .slice(0, 3);
}

function getEndingSoon(items) {
    return [...items]
        .filter((item) => item.status !== 'CLOSED' && item.endsAt)
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
    const categories = [...getCategoryCounts(items).entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (!categories.length) {
        renderState(categoriesGrid, 'empty', 'As categorias aparecerão quando houver itens disponíveis.');
        return;
    }
    categories.forEach(([category, count]) => {
        const card = createElement('article', { className: 'category-card' });
        appendChildren(card, [
            createElement('h3', { text: category }),
            createElement('p', { text: `${count} item(ns) disponível(is) nesta categoria.` }),
            createElement('a', { text: 'Navegar na categoria', attrs: { href: `html/categoria.html?categoria=${encodeURIComponent(category)}` } })
        ]);
        categoriesGrid.appendChild(card);
    });
}

function renderHome() {
    renderAuctionList(featuredGrid, getFeatured(auctions), 'Nenhum leilão em destaque no momento.');
    renderAuctionList(endingGrid, getEndingSoon(auctions), 'Nenhum leilão próximo do encerramento.');
    renderCategories(auctions);
    updateCarouselControls();
}

function updateCarouselControls() {
    const maxScrollLeft = Math.max(0, endingGrid.scrollWidth - endingGrid.clientWidth);
    previousButton.disabled = endingGrid.scrollLeft <= 1;
    nextButton.disabled = endingGrid.scrollLeft >= maxScrollLeft - 1;
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
        homeStatus.classList.remove('sr-only', 'error-state');
        homeStatus.classList.add('success-state');
        homeStatus.textContent = auction.isFavorite ? 'Leilão adicionado aos favoritos.' : 'Leilão removido dos favoritos.';
    } catch (error) {
        homeStatus.classList.remove('sr-only');
        homeStatus.classList.add('error-state');
        homeStatus.textContent = error.message;
        button.disabled = false;
    }
}

function addImmediateItem(id) {
    const auction = auctions.find((item) => String(item.id) === String(id));
    if (!auction) return;
    addToCart({ id: auction.id, title: auction.title, price: auction.price, imageUrl: auction.imageUrl, imageAlt: auction.imageAlt, category: auction.category });
    homeStatus.classList.remove('sr-only', 'error-state');
    homeStatus.classList.add('success-state');
    homeStatus.textContent = `${auction.title} foi adicionado ao carrinho.`;
}

function handleCardAction(event) {
    const favoriteButton = event.target.closest('[data-action="favorite"]');
    const buyButton = event.target.closest('[data-action="buy-now"]');
    if (favoriteButton) toggleFavorite(favoriteButton);
    if (buyButton) addImmediateItem(buyButton.dataset.auctionId);
}

async function loadHome() {
    renderState(featuredGrid, 'loading', 'Carregando leilões em destaque...');
    renderState(endingGrid, 'loading', 'Carregando leilões próximos do encerramento...');
    renderState(categoriesGrid, 'loading', 'Carregando categorias...');
    try {
        auctions = normalizeCollection(await getAuctions());
        renderHome();
    } catch (error) {
        renderState(featuredGrid, 'error', error.message);
        renderState(endingGrid, 'error', error.message);
        renderState(categoriesGrid, 'error', error.message);
    }
}

featuredGrid.addEventListener('click', handleCardAction);
endingGrid.addEventListener('click', handleCardAction);
previousButton.addEventListener('click', () => scrollCarousel(-1));
nextButton.addEventListener('click', () => scrollCarousel(1));
endingGrid.addEventListener('scroll', updateCarouselControls);
window.addEventListener('resize', updateCarouselControls);
loadHome();
