import { createElement, formatCurrency } from '../components/dom.js';
import { createIcon } from '../components/icons.js';
import { setLiveMessage } from '../components/statusMessage.js';
import { addToCart } from '../services/cartService.js';
import { t } from '../services/i18n.js';
import { getOfficialStoreProducts } from '../services/officialStoreService.js';

const grid = document.getElementById('official-products');
const status = document.getElementById('store-status');

function createProductCard(product) {
    const article = createElement('article', { className: 'official-product-card' });
    const media = createElement('div', { className: 'official-product-card__media', attrs: { 'aria-hidden': 'true' } });
    media.appendChild(createIcon(product.icon, { size: 52 }));
    const title = createElement('h2', { text: t(product.title) });
    const description = createElement('p', { className: 'official-product-card__description', text: t(product.description) });
    const price = createElement('strong', { className: 'official-product-card__price', text: formatCurrency(product.price) });
    const button = createElement('button', {
        className: 'btn-primary', text: t('Adicionar ao carrinho'), attrs: { type: 'button' },
        dataset: { productId: product.id }
    });
    article.append(media, title, description, price, button);
    return article;
}

function addProduct(productId) {
    const product = getOfficialStoreProducts().find((item) => item.id === productId);
    if (!product) return;
    addToCart({
        id: product.id, type: 'STORE_PRODUCT', title: product.title, price: product.price,
        icon: product.icon, category: 'Loja Oficial Midas'
    });
    setLiveMessage(status, t('{title} foi adicionado ao carrinho.', { title: t(product.title) }));
}

getOfficialStoreProducts().forEach((product) => grid.appendChild(createProductCard(product)));
grid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-product-id]');
    if (button) addProduct(button.dataset.productId);
});
