import { clearElement, createElement, formatCurrency, formatDateTime } from '../components/dom.js';
import { clearFieldError, validatePositiveNumber } from '../components/formValidation.js';
import { closeDialog, initDialog, openDialog } from '../components/modal.js';
import { renderState, setLiveMessage } from '../components/statusMessage.js';
import { getUserErrorMessage } from '../components/userError.js';
import { buyNowAuction, getAuctionById, getBidHistory, placeBid } from '../services/auctionService.js';
import { normalizeCollection } from '../services/api.js';
import { t } from '../services/i18n.js';

const params = new URLSearchParams(window.location.search);
const auctionId = params.get('id');
const state = document.getElementById('details-state');
const content = document.getElementById('details-content');
const bidSection = document.getElementById('bid-section');
const bidForm = document.getElementById('bid-form');
const bidInput = document.getElementById('bid-amount');
const bidMinimumHelp = document.getElementById('bid-minimum-help');
const actionStatus = document.getElementById('details-action-status');
const bidHistory = document.getElementById('bid-history');
const thumbnailList = document.getElementById('details-thumbnails');
const confirmDialog = document.getElementById('bid-confirm-dialog');
const confirmMessage = document.getElementById('bid-confirm-message');
const confirmButton = document.getElementById('bid-confirm-button');
const buyNowContainer = document.getElementById('buy-now-action');
const buyNowInfo = document.getElementById('details-buy-now-info');
const buyNowDialog = document.getElementById('buy-now-confirm-dialog');
const buyNowMessage = document.getElementById('buy-now-confirm-message');
const buyNowConfirmButton = document.getElementById('buy-now-confirm-button');

let auction = null;
let pendingBid = null;
let countdownTimer = null;

function setText(id, value, fallback = 'Não informado') {
    const element = document.getElementById(id);
    if (element) element.textContent = value || t(fallback);
}

function getGalleryImages(item) {
    const images = Array.isArray(item.images) ? [...item.images] : [];

    if (item.imageUrl && !images.some((image) => image.url === item.imageUrl)) {
        images.unshift({ url: item.imageUrl, alt: item.imageAlt });
    }

    const validImages = images
        .filter((image) => image?.url)
        .map((image, index) => ({
            url: image.url,
            alt: image.alt || t('Imagem {current} de {title}', { current: index + 1, title: item.title })
        }));

    if (validImages.length) return validImages;
    return [{
        url: '../assets/img/item-default.svg',
        alt: t('Imagem de {title}', { title: item.title })
    }];
}

function selectGalleryImage(image, button) {
    const mainImage = document.getElementById('details-main-image');
    mainImage.src = image.url;
    mainImage.alt = image.alt;
    thumbnailList.querySelectorAll('.thumbnail-button').forEach((item) => item.setAttribute('aria-current', 'false'));
    button.setAttribute('aria-current', 'true');
}

function createThumbnail(image, index, total) {
    const button = createElement('button', {
        className: 'thumbnail-button',
        attrs: {
            type: 'button',
            'aria-label': t('Ver imagem {current} de {total}', { current: index + 1, total }),
            'aria-current': String(index === 0)
        }
    });
    button.appendChild(createElement('img', { attrs: { src: image.url, alt: '', loading: 'lazy', decoding: 'async' } }));
    button.addEventListener('click', () => selectGalleryImage(image, button));
    return button;
}

function renderGallery(item) {
    const images = getGalleryImages(item);
    clearElement(thumbnailList);
    images.forEach((image, index) => thumbnailList.appendChild(createThumbnail(image, index, images.length)));
    selectGalleryImage(images[0], thumbnailList.firstElementChild);
}

function moveGalleryFocus(event) {
    const button = event.target.closest('.thumbnail-button');
    if (!button) return;
    const buttons = [...thumbnailList.querySelectorAll('.thumbnail-button')];
    const currentIndex = buttons.indexOf(button);
    const keyOffsets = { ArrowLeft: -1, ArrowRight: 1 };
    let nextIndex = keyOffsets[event.key] !== undefined ? currentIndex + keyOffsets[event.key] : null;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = buttons.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const target = buttons[(nextIndex + buttons.length) % buttons.length];
    target.focus();
    target.click();
}

function formatCountdown(endsAt) {
    const remaining = new Date(endsAt).getTime() - Date.now();
    if (!Number.isFinite(remaining) || remaining <= 0) return t('Leilão encerrado');
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return t('Encerra em {days}d {hours}h {minutes}min {seconds}s', { days, hours, minutes, seconds });
}

function updateCountdown() {
    const countdown = document.getElementById('details-countdown');
    if (!auction?.endsAt || !countdown) return;
    const expired = new Date(auction.endsAt).getTime() <= Date.now();
    if (expired && auction.status !== 'CLOSED') {
        auction.status = 'CLOSED';
        setText('details-price-label', t('Lance final'));
        renderActions(auction);
    }
    countdown.textContent = auction.status === 'CLOSED' ? t('Leilão encerrado') : formatCountdown(auction.endsAt);
    if (expired) stopCountdown();
}

function stopCountdown() {
    if (!countdownTimer) return;
    window.clearInterval(countdownTimer);
    countdownTimer = null;
}

function startCountdown(item) {
    stopCountdown();
    updateCountdown();
    if (item.status !== 'CLOSED' && item.endsAt) countdownTimer = window.setInterval(updateCountdown, 1000);
}

function getCurrentBid(item) {
    return Number(item.currentBid ?? item.startingBid ?? 0);
}

function updateBidMinimum(item) {
    const currentBid = getCurrentBid(item);
    bidInput.min = String(currentBid + 0.01);
    bidMinimumHelp.textContent = t('O novo lance deve ser maior que {price}.', { price: formatCurrency(currentBid) });
}

function createBuyNowButton(item) {
    const button = createElement('button', {
        className: 'btn-primary buy-now-button',
        text: t('Comprar Agora por {price}', { price: formatCurrency(item.buyNowPrice) }),
        attrs: { type: 'button' }
    });
    button.addEventListener('click', () => openBuyNowConfirmation(item, button));
    return button;
}

function openBuyNowConfirmation(item, button) {
    buyNowMessage.textContent = t(
        'Ao confirmar a compra por {price}, o leilão será encerrado e você será direcionado ao checkout.',
        { price: formatCurrency(item.buyNowPrice) }
    );
    openDialog(buyNowDialog, button);
}

function renderActions(item) {
    if (item.status === 'CLOSED') {
        bidSection.hidden = true;
        buyNowInfo.hidden = true;
        return;
    }
    bidSection.hidden = false;
    updateBidMinimum(item);
    clearElement(buyNowContainer);
    const hasBuyNow = Number(item.buyNowPrice) > 0;
    buyNowContainer.hidden = !hasBuyNow;
    buyNowInfo.hidden = !hasBuyNow;
    if (!hasBuyNow) return;
    buyNowContainer.appendChild(createBuyNowButton(item));
    buyNowInfo.textContent = t('Compra imediata disponível por {price}. Essa opção encerra o leilão na hora.', {
        price: formatCurrency(item.buyNowPrice)
    });
}

function renderAuction(item) {
    renderGallery(item);
    setText('details-category', t(item.category));
    setText('details-title', item.title);
    setText('details-description', item.description);
    setText('details-condition', t(item.condition));
    setText('details-ends-at', formatDateTime(item.endsAt));
    setText('details-brand', item.brand ? item.brand : t('Não informada'));
    setText('details-price-label', t(item.status === 'CLOSED' ? 'Lance final' : 'Lance atual'));
    setText('details-price', formatCurrency(getCurrentBid(item)));
    renderActions(item);
    startCountdown(item);
    content.hidden = false;
    clearElement(state);
}

function renderBidItem(bid, index, total) {
    const item = createElement('article', { className: 'bid-history-item' });
    const info = createElement('div', { className: 'bid-history-info' });
    const position = total - index;
    info.append(
        createElement('strong', { text: t('Lance #{number}', { number: position }) }),
        createElement('time', { text: formatDateTime(bid.createdAt), attrs: { datetime: bid.createdAt || '' } })
    );
    item.append(info, createElement('strong', { className: 'bid-history-value', text: formatCurrency(bid.amount) }));
    return item;
}

function renderBidHistoryItems(bids) {
    clearElement(bidHistory);
    if (!bids.length) {
        renderState(bidHistory, 'empty', t('Este item ainda não recebeu lances.'));
        return;
    }
    const sorted = [...bids].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    sorted.forEach((bid, index) => bidHistory.appendChild(renderBidItem(bid, index, sorted.length)));
}

async function loadBidHistory() {
    if (!auctionId) return;
    renderState(bidHistory, 'loading', t('Carregando histórico de lances...'));
    try {
        renderBidHistoryItems(normalizeCollection(await getBidHistory(auctionId)));
    } catch (error) {
        renderState(bidHistory, 'error', getUserErrorMessage(
            error,
            t('Não conseguimos carregar o histórico de lances agora. Tente novamente em instantes.')
        ));
    }
}

function validateBid() {
    const validNumber = validatePositiveNumber(bidInput, 'O lance', getCurrentBid(auction));
    if (!validNumber) return false;
    clearFieldError(bidInput);
    return true;
}

function requestBidConfirmation(event) {
    event.preventDefault();
    if (!validateBid()) return;
    pendingBid = Number(bidInput.value);
    confirmMessage.textContent = t('Você confirma o lance de {amount} em {title}?', {
        amount: formatCurrency(pendingBid),
        title: auction.title
    });
    openDialog(confirmDialog, bidForm.querySelector('[type="submit"]'));
}

function applyBidUpdate(updated) {
    auction = updated?.auction || { ...auction, currentBid: pendingBid };
    setText('details-price', formatCurrency(getCurrentBid(auction)));
    updateBidMinimum(auction);
    bidInput.value = '';
}

async function confirmBid() {
    if (!pendingBid) return;
    confirmButton.disabled = true;
    setLiveMessage(actionStatus, t('Enviando lance...'));
    try {
        applyBidUpdate(await placeBid(auctionId, pendingBid));
        closeDialog(confirmDialog);
        setLiveMessage(actionStatus, t('Lance registrado com sucesso.'));
        await loadBidHistory();
    } catch (error) {
        closeDialog(confirmDialog);
        setLiveMessage(actionStatus, getUserErrorMessage(
            error,
            t('Não conseguimos registrar seu lance agora. Confira o valor e tente novamente.')
        ), true);
    } finally {
        pendingBid = null;
        confirmButton.disabled = false;
    }
}

async function confirmBuyNow() {
    if (!auction?.buyNowPrice) return;
    buyNowConfirmButton.disabled = true;
    setLiveMessage(actionStatus, t('Confirmando Compra Imediata...'));
    try {
        await buyNowAuction(auctionId);
        closeDialog(buyNowDialog);
        window.location.href = `checkout.html?auctionId=${encodeURIComponent(auctionId)}&source=buy-now`;
    } catch (error) {
        closeDialog(buyNowDialog);
        setLiveMessage(actionStatus, getUserErrorMessage(
            error,
            t('Não conseguimos concluir a Compra Imediata agora. Atualize a página e tente novamente.')
        ), true);
    } finally {
        buyNowConfirmButton.disabled = false;
    }
}

async function loadAuction() {
    if (!auctionId) {
        renderState(state, 'error', t('Não encontramos o item solicitado. Volte ao catálogo e escolha um leilão.'));
        return;
    }
    renderState(state, 'loading', t('Carregando detalhes do item...'));
    try {
        auction = await getAuctionById(auctionId);
        renderAuction(auction);
        await loadBidHistory();
    } catch (error) {
        renderState(state, 'error', getUserErrorMessage(
            error,
            t('Não conseguimos carregar os detalhes deste item agora. Tente novamente em instantes.')
        ));
    }
}

initDialog(confirmDialog);
initDialog(buyNowDialog);
bidForm.addEventListener('submit', requestBidConfirmation);
bidInput.addEventListener('input', () => clearFieldError(bidInput));
confirmButton.addEventListener('click', confirmBid);
buyNowConfirmButton.addEventListener('click', confirmBuyNow);
thumbnailList.addEventListener('keydown', moveGalleryFocus);
window.addEventListener('pagehide', stopCountdown);
loadAuction();
