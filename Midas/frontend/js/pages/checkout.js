import { clearFieldError, focusFirstInvalid, setFieldError, validateEmail, validateRequired } from '../components/formValidation.js';
import { clearElement, createElement, formatCurrency } from '../components/dom.js';
import { getUserErrorMessage, UserFacingError } from '../components/userError.js';
import { renderState, setLiveMessage } from '../components/statusMessage.js';
import { getAuctionById } from '../services/auctionService.js';
import { clearCart, getCart, getCartTotal } from '../services/cartService.js';
import { checkoutCart, checkoutWonAuction } from '../services/orderService.js';
import { t } from '../services/i18n.js';

const auctionId = new URLSearchParams(window.location.search).get('auctionId');
const state = document.getElementById('checkout-state');
const content = document.getElementById('checkout-content');
const form = document.getElementById('checkout-form');
const status = document.getElementById('checkout-form-status');
const summaryList = document.getElementById('checkout-summary-list');
const totalElement = document.getElementById('checkout-total');
const successSection = document.getElementById('checkout-success');
let checkoutItems = [];
let checkoutTotal = 0;

const requiredFields = [
    ['checkout-name', 'Nome completo'], ['checkout-email', 'E-mail'], ['checkout-phone', 'Telefone'],
    ['checkout-address', 'Endereço'], ['checkout-city', 'Cidade'], ['checkout-postal-code', 'CEP'],
    ['checkout-card-name', 'Nome no cartão'], ['checkout-card-number', 'Número do cartão fictício'], ['checkout-expiry', 'Validade']
];

function validateCardNumber(field) {
    const digits = field.value.replace(/\D/g, '');
    const valid = digits.length >= 12;
    if (!valid) setFieldError(field, t('Use um número fictício com pelo menos 12 dígitos.'));
    else clearFieldError(field);
    return valid;
}

function validateExpiry(field) {
    const valid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(field.value.trim());
    if (!valid) setFieldError(field, t('Use o formato MM/AA.'));
    else clearFieldError(field);
    return valid;
}

function validateForm() {
    let valid = true;
    requiredFields.forEach(([id, label]) => {
        if (!validateRequired(document.getElementById(id), label)) valid = false;
    });
    if (!validateEmail(document.getElementById('checkout-email'))) valid = false;
    if (!validateCardNumber(document.getElementById('checkout-card-number'))) valid = false;
    if (!validateExpiry(document.getElementById('checkout-expiry'))) valid = false;
    if (!valid) focusFirstInvalid(form);
    return valid;
}

function renderSummary() {
    clearElement(summaryList);
    checkoutItems.forEach((item) => {
        const row = createElement('div', { className: 'checkout-summary-item' });
        row.append(
            createElement('span', { text: `${t(item.title)}${item.quantity ? ` × ${item.quantity}` : ''}` }),
            createElement('span', { text: formatCurrency(Number(item.price) * (item.quantity || 1)) })
        );
        summaryList.appendChild(row);
    });
    totalElement.textContent = formatCurrency(checkoutTotal);
}

async function prepareAuctionCheckout() {
    document.getElementById('checkout-title').textContent = t('Finalizar item arrematado');
    document.getElementById('checkout-description').textContent = t('Finalize o pagamento fictício do item que você venceu.');
    const auction = await getAuctionById(auctionId);
    if (!auction.canCheckout) throw new UserFacingError(t('Este item ainda não está disponível para pagamento nesta conta.'));
    const price = Number(auction.finalPrice ?? auction.finalBid ?? auction.buyNowPrice ?? auction.currentBid ?? 0);
    checkoutItems = [{ id: auction.id, type: 'AUCTION', title: auction.title, price, quantity: 1 }];
    checkoutTotal = price;
}

function prepareCartCheckout() {
    document.getElementById('checkout-title').textContent = t('Finalizar compra da Loja Oficial Midas');
    document.getElementById('checkout-description').textContent = t('Confira os produtos da Loja Oficial Midas e preencha os dados. O checkout é acadêmico e não realiza cobrança real.');
    checkoutItems = getCart();
    if (!checkoutItems.length) throw new UserFacingError(t('Seu carrinho está vazio. Escolha um produto da Loja Oficial Midas antes de continuar.'));
    checkoutTotal = getCartTotal(checkoutItems);
}

async function prepareCheckout() {
    renderState(state, 'loading', t('Preparando checkout...'));
    try {
        if (auctionId) await prepareAuctionCheckout();
        else prepareCartCheckout();
        renderSummary();
        state.textContent = '';
        content.hidden = false;
    } catch (error) {
        renderState(state, 'error', getUserErrorMessage(error, t('Não conseguimos preparar o checkout agora. Tente novamente em instantes.')));
    }
}

function buildCheckoutPayload() {
    const data = Object.fromEntries(new FormData(form));
    return {
        customer: {
            name: data.name, email: data.email, phone: data.phone,
            address: data.address, city: data.city, postalCode: data.postalCode
        },
        payment: {
            cardName: data.cardName,
            cardLast4: data.cardNumber.replace(/\D/g, '').slice(-4),
            expiry: data.expiry, simulated: true
        },
        items: checkoutItems.map(({ id, type, quantity }) => ({ id, type, quantity: quantity || 1 }))
    };
}

function showSuccess(order) {
    content.hidden = true;
    successSection.hidden = false;
    const code = order?.orderNumber || order?.id || t('confirmado');
    const message = auctionId
        ? t('Pagamento do item confirmado. Pedido {code} registrado sem cobrança real.', { code })
        : t('Compra da Loja Oficial Midas confirmada. Pedido {code} registrado sem cobrança real.', { code });
    document.getElementById('checkout-success-message').textContent = message;
    successSection.focus();
}

async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    setLiveMessage(status, t('Confirmando compra...'));
    try {
        const payload = buildCheckoutPayload();
        const order = auctionId ? await checkoutWonAuction(auctionId, payload) : await checkoutCart(payload);
        if (!auctionId) clearCart();
        setLiveMessage(status, t('Compra confirmada.'));
        showSuccess(order);
    } catch (error) {
        setLiveMessage(status, getUserErrorMessage(error, t('Não conseguimos confirmar a compra agora. Revise os dados e tente novamente.')), true);
    } finally {
        submitButton.disabled = false;
    }
}

requiredFields.forEach(([id]) => {
    document.getElementById(id).addEventListener('input', (event) => clearFieldError(event.currentTarget));
});
form.addEventListener('submit', handleSubmit);
prepareCheckout();
