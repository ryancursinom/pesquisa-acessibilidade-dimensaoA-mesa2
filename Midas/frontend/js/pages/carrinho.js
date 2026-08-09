import { appendChildren, clearElement, createElement, formatCurrency } from '../components/dom.js';
import { getCart, getCartItemCount, getCartTotal, removeFromCart, updateCartQuantity } from '../services/cartService.js';

const list = document.getElementById('cart-list');
const count = document.getElementById('cart-item-count');
const total = document.getElementById('cart-total');
const checkoutLink = document.getElementById('cart-checkout-link');

function createQuantityField(item) {
    const wrapper = createElement('div', { className: 'cart-quantity' });
    const label = createElement('label', { text: 'Quantidade', attrs: { for: `quantity-${item.id}` } });
    const input = createElement('input', {
        attrs: { id: `quantity-${item.id}`, type: 'number', min: 1, value: item.quantity, inputmode: 'numeric', 'aria-label': `Quantidade de ${item.title}` },
        dataset: { action: 'quantity', itemId: item.id }
    });
    wrapper.append(label, input);
    return wrapper;
}

function createCartItem(item) {
    const article = createElement('article', { className: 'cart-item' });
    const image = createElement('img', {
        attrs: { src: item.imageUrl || '../assets/img/item-default.svg', alt: item.imageAlt || `Imagem de ${item.title}`, loading: 'lazy' }
    });
    const info = createElement('div', { className: 'cart-item-info' });
    info.append(
        createElement('h2', { text: item.title }),
        createElement('p', { text: item.category || 'Compra imediata' }),
        createElement('strong', { text: formatCurrency(item.price) })
    );
    const controls = createElement('div');
    const remove = createElement('button', {
        className: 'btn-danger', text: 'Remover', attrs: { type: 'button', 'aria-label': `Remover ${item.title} do carrinho` },
        dataset: { action: 'remove', itemId: item.id }
    });
    appendChildren(controls, [createQuantityField(item), remove]);
    article.append(image, info, controls);
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
        const message = createElement('div', { className: 'empty-state' });
        message.append(
            createElement('p', { text: 'Seu carrinho está vazio.' }),
            createElement('a', { className: 'btn-primary', text: 'Ir ao catálogo', attrs: { href: 'catalogo.html' } })
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
