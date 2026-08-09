import { clearFieldError, focusFirstInvalid, setFieldError, validateEmail, validateRequired } from '../components/formValidation.js';
import { clearElement, createElement, formatCurrency } from '../components/dom.js';
import { renderState, setLiveMessage } from '../components/statusMessage.js';
import { getAuctionById } from '../services/auctionService.js';
import { clearCart, getCart, getCartTotal } from '../services/cartService.js';
import { checkoutCart, checkoutWonAuction } from '../services/orderService.js';

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
    ['checkout-name', 'Nome completo'],
    ['checkout-email', 'E-mail'],
    ['checkout-phone', 'Telefone'],
    ['checkout-address', 'Endereço'],
    ['checkout-city', 'Cidade'],
    ['checkout-postal-code', 'CEP'],
    ['checkout-card-name', 'Nome no cartão'],
    ['checkout-card-number', 'Número do cartão fictício'],
    ['checkout-expiry', 'Validade']
];

function validateCardNumber(field) {
    const digits = field.value.replace(/\D/g, '');
    const valid = digits.length >= 12;
    if (!valid) setFieldError(field, 'Use um número fictício com pelo menos 12 dígitos.');
    else clearFieldError(field);
    return valid;
}

function validateExpiry(field) {
    const valid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(field.value.trim());
    if (!valid) setFieldError(field, 'Use o formato MM/AA.');
    else clearFieldError(field);
    return valid;
}

function validateForm() {
    let valid = true;
    requiredFields.forEach(([id, label]) => {
        const field = document.getElementById(id);
        if (!validateRequired(field, label)) valid = false;
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
            createElement('span', { text: `${item.title}${item.quantity ? ` × ${item.quantity}` : ''}` }),
            createElement('span', { text: formatCurrency(Number(item.price) * (item.quantity || 1)) })
        );
        summaryList.appendChild(row);
    });
    totalElement.textContent = formatCurrency(checkoutTotal);
}

async function prepareAuctionCheckout() {
    document.getElementById('checkout-title').textContent = 'Finalizar item arrematado';
    document.getElementById('checkout-description').textContent = 'Este pagamento fictício fica disponível apenas ao vencedor depois do encerramento do leilão.';
    const auction = await getAuctionById(auctionId);
    if (!auction.canCheckout) throw new Error('Este leilão não está disponível para checkout nesta conta.');
    const price = Number(auction.currentBid || auction.finalBid || 0);
    checkoutItems = [{ id: auction.id, title: auction.title, price, quantity: 1 }];
    checkoutTotal = price;
}

function prepareCartCheckout() {
    checkoutItems = getCart();
    if (!checkoutItems.length) throw new Error('Seu carrinho está vazio. Adicione um item de compra imediata antes de continuar.');
    checkoutTotal = getCartTotal(checkoutItems);
}

async function prepareCheckout() {
    renderState(state, 'loading', 'Preparando checkout...');
    try {
        if (auctionId) await prepareAuctionCheckout();
        else prepareCartCheckout();
        renderSummary();
        state.textContent = '';
        content.hidden = false;
    } catch (error) {
        renderState(state, 'error', error.message);
    }
}

function buildCheckoutPayload() {
    const data = Object.fromEntries(new FormData(form));
    return {
        customer: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            postalCode: data.postalCode
        },
        payment: {
            cardName: data.cardName,
            cardLast4: data.cardNumber.replace(/\D/g, '').slice(-4),
            expiry: data.expiry,
            simulated: true
        },
        items: checkoutItems.map(({ id, quantity }) => ({ id, quantity: quantity || 1 }))
    };
}

function showSuccess(order) {
    content.hidden = true;
    successSection.hidden = false;
    const code = order?.orderNumber || order?.id || 'confirmado';
    document.getElementById('checkout-success-message').textContent = `Pedido ${code} registrado com sucesso. Nenhuma cobrança real foi realizada.`;
    successSection.focus?.();
}

async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    setLiveMessage(status, 'Confirmando compra...');
    try {
        const payload = buildCheckoutPayload();
        const order = auctionId ? await checkoutWonAuction(auctionId, payload) : await checkoutCart(payload);
        if (!auctionId) clearCart();
        setLiveMessage(status, 'Compra confirmada.');
        showSuccess(order);
    } catch (error) {
        setLiveMessage(status, error.message, true);
    } finally {
        submitButton.disabled = false;
    }
}

requiredFields.forEach(([id]) => {
    document.getElementById(id).addEventListener('input', (event) => clearFieldError(event.currentTarget));
});
form.addEventListener('submit', handleSubmit);
prepareCheckout();
