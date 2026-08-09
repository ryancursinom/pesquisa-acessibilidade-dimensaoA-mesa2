import { clearElement, createElement, formatCurrency, formatDateTime } from '../components/dom.js';
import { clearFieldError, validatePositiveNumber } from '../components/formValidation.js';
import { closeDialog, initDialog, openDialog } from '../components/modal.js';
import { renderState, setLiveMessage } from '../components/statusMessage.js';
import { getAuctionById, getBidHistory, placeBid } from '../services/auctionService.js';
import { normalizeCollection } from '../services/api.js';
import { addToCart } from '../services/cartService.js';

const params = new URLSearchParams(window.location.search);
const auctionId = params.get('id');
const state = document.getElementById('details-state');
const content = document.getElementById('details-content');
const bidSection = document.getElementById('bid-section');
const bidForm = document.getElementById('bid-form');
const bidInput = document.getElementById('bid-amount');
const actionStatus = document.getElementById('details-action-status');
const bidHistory = document.getElementById('bid-history');
const confirmDialog = document.getElementById('bid-confirm-dialog');
const confirmMessage = document.getElementById('bid-confirm-message');
const confirmButton = document.getElementById('bid-confirm-button');
let auction = null;
let pendingBid = null;

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || 'Não informado';
}

function getGalleryImages(item) {
    const images = Array.isArray(item.gallery) ? item.gallery : [];
    const primary = item.imageUrl ? [{ url: item.imageUrl, alt: item.imageAlt }] : [];
    const merged = [...primary, ...images].filter((image) => image?.url);
    return merged.length ? merged : [{ url: '../assets/img/item-default.svg', alt: `Imagem de ${item.title}` }];
}

function selectGalleryImage(image, button) {
    const mainImage = document.getElementById('details-main-image');
    mainImage.src = image.url;
    mainImage.alt = image.alt || `Imagem de ${auction.title}`;
    document.querySelectorAll('.thumbnail-button').forEach((item) => item.setAttribute('aria-current', 'false'));
    button.setAttribute('aria-current', 'true');
}

function renderGallery(item) {
    const images = getGalleryImages(item);
    const list = document.getElementById('details-thumbnails');
    clearElement(list);
    images.forEach((image, index) => {
        const button = createElement('button', {
            className: 'thumbnail-button',
            attrs: { type: 'button', 'aria-label': `Ver imagem ${index + 1} de ${images.length}`, 'aria-current': String(index === 0) }
        });
        const thumbnail = createElement('img', { attrs: { src: image.url, alt: '', loading: 'lazy' } });
        button.appendChild(thumbnail);
        button.addEventListener('click', () => selectGalleryImage(image, button));
        list.appendChild(button);
    });
    selectGalleryImage(images[0], list.firstElementChild);
}

function createBuyNowButton(item) {
    const button = createElement('button', { className: 'btn-primary', text: 'Comprar Agora', attrs: { type: 'button' } });
    button.addEventListener('click', () => {
        addToCart({ id: item.id, title: item.title, price: item.price, imageUrl: item.imageUrl, imageAlt: item.imageAlt, category: item.category });
        setLiveMessage(actionStatus, `${item.title} foi adicionado ao carrinho.`);
    });
    return button;
}

function renderPrimaryAction(item) {
    const container = document.getElementById('details-primary-action');
    clearElement(container);
    if (item.status === 'CLOSED') {
        container.appendChild(createElement('p', { text: 'Este leilão está encerrado.' }));
        bidSection.hidden = true;
        return;
    }
    if (item.saleType === 'BUY_NOW') {
        container.appendChild(createBuyNowButton(item));
        bidSection.hidden = true;
        return;
    }
    bidSection.hidden = false;
}

function renderAuction(item) {
    renderGallery(item);
    setText('details-category', item.category);
    setText('details-title', item.title);
    setText('details-description', item.description);
    setText('details-condition', item.condition);
    setText('details-ends-at', formatDateTime(item.endsAt));
    setText('details-brand', item.brand || 'Não informada');
    setText('details-seller', item.sellerName || 'Vendedor Midas');
    setText('details-price-label', item.saleType === 'BUY_NOW' ? 'Preço fixo' : item.status === 'CLOSED' ? 'Lance final' : 'Lance atual');
    setText('details-price', formatCurrency(item.saleType === 'BUY_NOW' ? item.price : item.currentBid));
    renderPrimaryAction(item);
    content.hidden = false;
    clearElement(state);
}

function renderBidItem(bid) {
    const item = createElement('article', { className: 'bid-history-item' });
    const left = createElement('div');
    left.append(
        createElement('strong', { text: bid.bidderName || 'Participante' }),
        createElement('time', { text: formatDateTime(bid.createdAt), attrs: { datetime: bid.createdAt || '' } })
    );
    item.append(left, createElement('strong', { text: formatCurrency(bid.amount) }));
    return item;
}

async function loadBidHistory() {
    if (!auctionId) return;
    renderState(bidHistory, 'loading', 'Carregando histórico de lances...');
    try {
        const bids = normalizeCollection(await getBidHistory(auctionId));
        clearElement(bidHistory);
        if (!bids.length) {
            renderState(bidHistory, 'empty', 'Este item ainda não recebeu lances.');
            return;
        }
        bids.forEach((bid) => bidHistory.appendChild(renderBidItem(bid)));
    } catch (error) {
        renderState(bidHistory, 'error', error.message);
    }
}

function validateBid() {
    const minimumBid = Number(auction?.minimumNextBid || auction?.currentBid || 0);
    const validNumber = validatePositiveNumber(bidInput, 'O lance', minimumBid);
    if (!validNumber) return false;
    clearFieldError(bidInput);
    return true;
}

function requestBidConfirmation(event) {
    event.preventDefault();
    if (!validateBid()) return;
    pendingBid = Number(bidInput.value);
    confirmMessage.textContent = `Você confirma o lance de ${formatCurrency(pendingBid)} em ${auction.title}?`;
    openDialog(confirmDialog, bidForm.querySelector('[type="submit"]'));
}

async function confirmBid() {
    if (!pendingBid) return;
    confirmButton.disabled = true;
    setLiveMessage(actionStatus, 'Enviando lance...');
    try {
        const updated = await placeBid(auctionId, pendingBid);
        auction = updated?.auction || { ...auction, currentBid: pendingBid };
        setText('details-price', formatCurrency(auction.currentBid));
        bidInput.value = '';
        closeDialog(confirmDialog);
        setLiveMessage(actionStatus, 'Lance registrado com sucesso.');
        await loadBidHistory();
    } catch (error) {
        closeDialog(confirmDialog);
        setLiveMessage(actionStatus, error.message, true);
    } finally {
        pendingBid = null;
        confirmButton.disabled = false;
    }
}

async function loadAuction() {
    if (!auctionId) {
        renderState(state, 'error', 'O item solicitado não foi informado.');
        return;
    }
    renderState(state, 'loading', 'Carregando detalhes do item...');
    try {
        auction = await getAuctionById(auctionId);
        renderAuction(auction);
        await loadBidHistory();
    } catch (error) {
        renderState(state, 'error', error.message);
    }
}

initDialog(confirmDialog);
bidForm.addEventListener('submit', requestBidConfirmation);
bidInput.addEventListener('input', () => clearFieldError(bidInput));
confirmButton.addEventListener('click', confirmBid);
loadAuction();
