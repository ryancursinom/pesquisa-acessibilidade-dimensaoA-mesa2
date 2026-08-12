import { limparErroCampo, focarPrimeiroCampoInvalido, definirErroCampo, validarEmail, validarCampoObrigatorio } from '../components/formValidation.js';
import { limparElemento, criarElemento, formatarMoeda } from '../components/dom.js';
import { obterMensagemErroUsuario, UserFacingError } from '../components/userError.js';
import { renderizarEstado, definirMensagemAoVivo } from '../components/statusMessage.js';
import { obterLeilaoPorId } from '../services/auctionService.js';
import { limparCarrinho, obterCarrinho, obterTotalCarrinho } from '../services/cartService.js';
import { finalizarCompraCarrinho, finalizarCompraLeilaoVencido } from '../services/orderService.js';
import { traduzir } from '../services/i18n.js';

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

function validarNumeroCartao(field) {
    const digits = field.value.replace(/\D/g, '');
    const valid = digits.length >= 12;
    if (!valid) definirErroCampo(field, traduzir('Use um número fictício com pelo menos 12 dígitos.'));
    else limparErroCampo(field);
    return valid;
}

function validarValidadeCartao(field) {
    const valid = /^(0[1-9]|1[0-2])\/\d{2}$/.test(field.value.trim());
    if (!valid) definirErroCampo(field, traduzir('Use o formato MM/AA.'));
    else limparErroCampo(field);
    return valid;
}

function validarFormularioPagamento() {
    let valid = true;
    requiredFields.forEach(([id, label]) => {
        if (!validarCampoObrigatorio(document.getElementById(id), label)) valid = false;
    });
    if (!validarEmail(document.getElementById('checkout-email'))) valid = false;
    if (!validarNumeroCartao(document.getElementById('checkout-card-number'))) valid = false;
    if (!validarValidadeCartao(document.getElementById('checkout-expiry'))) valid = false;
    if (!valid) focarPrimeiroCampoInvalido(form);
    return valid;
}

function renderizarResumoPagamento() {
    limparElemento(summaryList);
    checkoutItems.forEach((item) => {
        const row = criarElemento('div', { className: 'checkout-summary-item' });
        row.append(
            criarElemento('span', { text: `${traduzir(item.title)}${item.quantity ? ` × ${item.quantity}` : ''}` }),
            criarElemento('span', { text: formatarMoeda(Number(item.price) * (item.quantity || 1)) })
        );
        summaryList.appendChild(row);
    });
    totalElement.textContent = formatarMoeda(checkoutTotal);
}

async function prepararPagamentoLeilao() {
    document.getElementById('checkout-title').textContent = traduzir('Finalizar item arrematado');
    document.getElementById('checkout-description').textContent = traduzir('Finalize o pagamento fictício do item que você venceu.');
    const auction = await obterLeilaoPorId(auctionId);
    if (!auction.canCheckout) throw new UserFacingError(traduzir('Este item ainda não está disponível para pagamento nesta conta.'));
    const price = Number(auction.finalPrice ?? auction.finalBid ?? auction.buyNowPrice ?? auction.currentBid ?? 0);
    checkoutItems = [{ id: auction.id, type: 'AUCTION', title: auction.title, price, quantity: 1 }];
    checkoutTotal = price;
}

function prepararPagamentoCarrinho() {
    document.getElementById('checkout-title').textContent = traduzir('Finalizar compra da Loja Oficial Midas');
    document.getElementById('checkout-description').textContent = traduzir('Confira os produtos da Loja Oficial Midas e preencha os dados. O checkout é acadêmico e não realiza cobrança real.');
    checkoutItems = obterCarrinho();
    if (!checkoutItems.length) throw new UserFacingError(traduzir('Seu carrinho está vazio. Escolha um produto da Loja Oficial Midas antes de continuar.'));
    checkoutTotal = obterTotalCarrinho(checkoutItems);
}

async function prepararPagamento() {
    renderizarEstado(state, 'loading', traduzir('Preparando checkout...'));
    try {
        if (auctionId) await prepararPagamentoLeilao();
        else prepararPagamentoCarrinho();
        renderizarResumoPagamento();
        state.textContent = '';
        content.hidden = false;
    } catch (error) {
        renderizarEstado(state, 'error', obterMensagemErroUsuario(error, traduzir('Não conseguimos preparar o checkout agora. Tente novamente em instantes.')));
    }
}

function criarDadosPagamento() {
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

function exibirConfirmacaoCompra(order) {
    content.hidden = true;
    successSection.hidden = false;
    const code = order?.orderNumber || order?.id || traduzir('confirmado');
    const message = auctionId
        ? traduzir('Pagamento do item confirmado. Pedido {code} registrado sem cobrança real.', { code })
        : traduzir('Compra da Loja Oficial Midas confirmada. Pedido {code} registrado sem cobrança real.', { code });
    document.getElementById('checkout-success-message').textContent = message;
    successSection.focus();
}

async function finalizarPagamento(event) {
    event.preventDefault();
    if (!validarFormularioPagamento()) return;
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    definirMensagemAoVivo(status, traduzir('Confirmando compra...'));
    try {
        const payload = criarDadosPagamento();
        const order = auctionId ? await finalizarCompraLeilaoVencido(auctionId, payload) : await finalizarCompraCarrinho(payload);
        if (!auctionId) limparCarrinho();
        definirMensagemAoVivo(status, traduzir('Compra confirmada.'));
        exibirConfirmacaoCompra(order);
    } catch (error) {
        definirMensagemAoVivo(status, obterMensagemErroUsuario(error, traduzir('Não conseguimos confirmar a compra agora. Revise os dados e tente novamente.')), true);
    } finally {
        submitButton.disabled = false;
    }
}

requiredFields.forEach(([id]) => {
    document.getElementById(id).addEventListener('input', (event) => limparErroCampo(event.currentTarget));
});
form.addEventListener('submit', finalizarPagamento);
prepararPagamento();
