import { appendChildren, clearElement, createElement, formatCurrency } from '../components/dom.js';
import { createIcon } from '../components/icons.js';
import { getCart, getCartItemCount, getCartTotal, removeFromCart, updateCartQuantity } from '../services/cartService.js';
import { t } from '../services/i18n.js';

const list = document.getElementById('cart-list');
const count = document.getElementById('cart-item-count');
const total = document.getElementById('cart-total');
const checkoutLink = document.getElementById('cart-checkout-link');

function createQuantityField(item) {
    const wrapper = createElement('div', { className: 'cart-quantity' });
    const label = createElement('label', { text: t('Quantidade'), attrs: { for: `quantity-${item.id}` } });
    const input = createElement('input', {
        attrs: {
            id: `quantity-${item.id}`, type: 'number', min: 1, max: 20, step: 1, value: item.quantity,
            inputmode: 'numeric', 'aria-label': t('Quantidade de {title}', { title: t(item.title) })
        },
        dataset: { action: 'quantity', itemId: item.id }
    });
    wrapper.append(label, input);
    return wrapper;
}

function createProductMedia(item) {
    const media = createElement('div', {
        className: 'cart-item-media', attrs: { 'aria-label': t('Produto da Loja Oficial Midas: {title}', { title: t(item.title) }), role: 'img' }
    });
    media.appendChild(createIcon(item.icon || 'package', { size: 44 }));
    return media;
}

function createCartItem(item) {
    const article = createElement('article', { className: 'cart-item' });
    const info = createElement('div', { className: 'cart-item-info' });
    info.append(
        createElement('h2', { text: t(item.title) }),
        createElement('p', { text: t(item.category || 'Loja Oficial Midas') }),
        createElement('strong', { text: formatCurrency(item.price) })
    );
    const controls = createElement('div', { className: 'cart-item-controls' });
    const remove = createElement('button', {
        className: 'btn-danger', attrs: { type: 'button', 'aria-label': t('Remover {title} do carrinho', { title: t(item.title) }) },
        dataset: { action: 'remove', itemId: item.id }
    });
    remove.append(createIcon('trash'), document.createTextNode(t('Remover')));
    appendChildren(controls, [createQuantityField(item), remove]);
    article.append(createProductMedia(item), info, controls);
    return article;
}

function renderCart() {
    const items = getCart();
    clearElement(list);
    count.textContent = String(getCartItemCount(items));
    total.textContent = formatCurrency(getCartTotal(items));
    checkoutLink.setAttribute('aria-disabled', String(items.length === 0));
    checkoutLink.tabIndex = items.length ? 0 : -1;

    if (!items.length) {
        const message = createElement('div', { className: 'empty-state cart-empty-state' });
        message.append(
            createElement('p', { text: t('Seu carrinho está vazio.') }),
            createElement('a', { className: 'btn-primary', text: t('Ir à Loja Oficial Midas'), attrs: { href: 'loja-oficial.html' } })
        );
        list.appendChild(message);
        return;
    }
    items.forEach((item) => list.appendChild(createCartItem(item)));
}

list.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-action="remove"]');
    if (!removeButton) return;
    removeFromCart(removeButton.dataset.itemId);
    renderCart();
});

list.addEventListener('change', (event) => {
    const quantityInput = event.target.closest('[data-action="quantity"]');
    if (!quantityInput) return;
    updateCartQuantity(quantityInput.dataset.itemId, quantityInput.value);
    renderCart();
});

checkoutLink.addEventListener('click', (event) => {
    if (!getCart().length) event.preventDefault();
});
renderCart();
