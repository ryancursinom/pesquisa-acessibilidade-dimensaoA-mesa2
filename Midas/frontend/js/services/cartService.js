const CART_KEY = 'midas-cart';

function readCart() {
    try {
        return JSON.parse(sessionStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function writeCart(items) {
    sessionStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('midas:cart-updated', { detail: items }));
}

export function getCart() {
    return readCart();
}

export function addToCart(product) {
    const items = readCart();
    const existing = items.find((item) => String(item.id) === String(product.id));

    if (existing) existing.quantity += 1;
    else items.push({ ...product, quantity: 1 });

    writeCart(items);
    return items;
}

export function updateCartQuantity(id, quantity) {
    const nextQuantity = Math.max(1, Number(quantity) || 1);
    const items = readCart().map((item) => (
        String(item.id) === String(id) ? { ...item, quantity: nextQuantity } : item
    ));
    writeCart(items);
    return items;
}

export function removeFromCart(id) {
    const items = readCart().filter((item) => String(item.id) !== String(id));
    writeCart(items);
    return items;
}

export function clearCart() {
    writeCart([]);
}

export function getCartTotal(items = readCart()) {
    return items.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0);
}

export function getCartItemCount(items = readCart()) {
    return items.reduce((total, item) => total + item.quantity, 0);
}
