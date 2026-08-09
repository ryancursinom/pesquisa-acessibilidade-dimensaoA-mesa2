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
const actionStatus = document.getElementById('details-action-status');
const bidHistory = document.getElementById('bid-history');
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

function setText(id, value, fallback = 'Não informado') {
    const element = document.getElementById(id);
    if (element) element.textContent = value || t(fallback);
}

function getGalleryImages(item) {
    if (item.imageUrl) return [{ url: item.imageUrl, alt: item.imageAlt }];
    return [{ url: '../assets/img/item-default.svg', alt: t('Imagem de {title}', { title: item.title }) }];
}

function selectGalleryImage(image, button) {
    const mainImage = document.getElementById('details-main-image');
    mainImage.src = image.url;
    mainImage.alt = image.alt || t('Imagem de {title}', { title: auction.title });
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
            attrs: {
                type: 'button',
                'aria-label': t('Ver imagem {current} de {total}', { current: index + 1, total: images.length }),
                'aria-current': String(index === 0)
            }
        });
        button.appendChild(createElement('img', { attrs: { src: image.url, alt: '', loading: 'lazy' } }));
        button.addEventListener('click', () => selectGalleryImage(image, button));
        list.appendChild(button);
    });
    selectGalleryImage(images[0], list.firstElementChild);
}

function createBuyNowButton(item) {
    const button = createElement('button', {
        className: 'btn-primary buy-now-button',
        text: t('Comprar Agora por {price}', { price: formatCurrency(item.buyNowPrice) }),
        attrs: { type: 'button' }
    });
    button.addEventListener('click', () => {
        buyNowMessage.textContent = t('Ao confirmar a compra por {price}, o leilão será encerrado e você será direcionado ao checkout.', {
            price: formatCurrency(item.buyNowPrice)
        });
        openDialog(buyNowDialog, button);
    });
    return button;
}

function renderActions(item) {
    if (item.status === 'CLOSED') {
        bidSection.hidden = true;
        buyNowInfo.hidden = true;
        return;
    }
    bidSection.hidden = false;
    clearElement(buyNowContainer);
    if (!item.buyNowPrice) {
        buyNowContainer.hidden = true;
        buyNowInfo.hidden = true;
        return;
    }
    buyNowContainer.hidden = false;
    buyNowContainer.appendChild(createBuyNowButton(item));
    buyNowInfo.hidden = false;
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
    setText('details-brand', item.brand ? t(item.brand) : t('Não informada'));
    setText('details-seller', item.sellerName || t('Vendedor Midas'));
    setText('details-price-label', t(item.status === 'CLOSED' ? 'Lance final' : 'Lance atual'));
    setText('details-price', formatCurrency(item.currentBid ?? item.startingBid ?? 0));
    renderActions(item);
    content.hidden = false;
    clearElement(state);
}

function renderBidItem(bid) {
    const item = createElement('article', { className: 'bid-history-item' });
    const left = createElement('div');
    left.append(
        createElement('strong', { text: bid.bidderName || t('Participante') }),
        createElement('time', { text: formatDateTime(bid.createdAt), attrs: { datetime: bid.createdAt || '' } })
    );
    item.append(left, createElement('strong', { text: formatCurrency(bid.amount) }));
    return item;
}

async function loadBidHistory() {
    if (!auctionId) return;
    renderState(bidHistory, 'loading', t('Carregando histórico de lances...'));
    try {
        const bids = normalizeCollection(await getBidHistory(auctionId));
        clearElement(bidHistory);
        if (!bids.length) {
            renderState(bidHistory, 'empty', t('Este item ainda não recebeu lances.'));
            return;
        }
        bids.forEach((bid) => bidHistory.appendChild(renderBidItem(bid)));
    } catch (error) {
        renderState(bidHistory, 'error', getUserErrorMessage(error, t('Não conseguimos carregar o histórico de lances agora. Tente novamente em instantes.')));
    }
}

function validateBid() {
    const minimumBid = Number(auction?.minimumNextBid || auction?.currentBid || auction?.startingBid || 0);
    const validNumber = validatePositiveNumber(bidInput, 'O lance', minimumBid);
    if (!validNumber) return false;
    clearFieldError(bidInput);
    return true;
}

function requestBidConfirmation(event) {
    event.preventDefault();
    if (!validateBid()) return;
    pendingBid = Number(bidInput.value);
    confirmMessage.textContent = t('Você confirma o lance de {amount} em {title}?', {
        amount: formatCurrency(pendingBid), title: auction.title
    });
    openDialog(confirmDialog, bidForm.querySelector('[type="submit"]'));
}

async function confirmBid() {
    if (!pendingBid) return;
    confirmButton.disabled = true;
    setLiveMessage(actionStatus, t('Enviando lance...'));
    try {
        const updated = await placeBid(auctionId, pendingBid);
        auction = updated?.auction || { ...auction, currentBid: pendingBid };
        setText('details-price', formatCurrency(auction.currentBid));
        bidInput.value = '';
        closeDialog(confirmDialog);
        setLiveMessage(actionStatus, t('Lance registrado com sucesso.'));
        await loadBidHistory();
    } catch (error) {
        closeDialog(confirmDialog);
        setLiveMessage(actionStatus, getUserErrorMessage(error, t('Não conseguimos registrar seu lance agora. Confira o valor e tente novamente.')), true);
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
        setLiveMessage(actionStatus, getUserErrorMessage(error, t('Não conseguimos concluir a Compra Imediata agora. Atualize a página e tente novamente.')), true);
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
        renderState(state, 'error', getUserErrorMessage(error, t('Não conseguimos carregar os detalhes deste item agora. Tente novamente em instantes.')));
    }
}

initDialog(confirmDialog);
initDialog(buyNowDialog);
bidForm.addEventListener('submit', requestBidConfirmation);
bidInput.addEventListener('input', () => clearFieldError(bidInput));
confirmButton.addEventListener('click', confirmBid);
buyNowConfirmButton.addEventListener('click', confirmBuyNow);
loadAuction();
