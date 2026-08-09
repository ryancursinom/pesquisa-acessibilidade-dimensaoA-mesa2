import { appendChildren, createElement, clearElement } from './dom.js';
import { getCartItemCount } from '../services/cartService.js';
import { isAuthenticated } from '../services/authService.js';

function createNavLink(root, page, href, label, currentPage) {
    const link = createElement('a', { text: label, attrs: { href: `${root}/${href}` } });
    if (page === currentPage) link.setAttribute('aria-current', 'page');
    return createElement('li').appendChild(link).parentElement;
}

function createHeaderContent() {
    const root = document.body.dataset.root || '..';
    const currentPage = document.body.dataset.page || '';
    const content = createElement('div', { className: 'container navbar__content' });
    const logoLink = createElement('a', {
        className: 'logo',
        attrs: { href: `${root}/index.html`, 'aria-label': 'Ir para a página inicial do Midas' }
    });
    const logo = createElement('img', { attrs: { src: `${root}/assets/img/logo.png`, alt: 'Midas' } });
    logoLink.appendChild(logo);

    const nav = createElement('nav', { className: 'nav-links', attrs: { 'aria-label': 'Navegação principal' } });
    const list = createElement('ul');
    list.append(
        createNavLink(root, 'home', 'index.html', 'Home', currentPage),
        createNavLink(root, 'sobre', 'html/sobre_nos.html', 'Sobre Nós', currentPage),
        createNavLink(root, 'catalogo', 'html/catalogo.html', 'Catálogo', currentPage),
        createNavLink(root, 'meus-leiloes', 'html/meus-leiloes.html', 'Meus Leilões', currentPage)
    );
    nav.appendChild(list);
    appendChildren(content, [logoLink, nav, createHeaderActions(root)]);
    return content;
}

function createHeaderActions(root) {
    const actions = createElement('div', { className: 'header-actions' });
    const initialCount = getCartItemCount();
    const cart = createElement('a', {
        className: 'header-icon-link',
        attrs: { href: `${root}/html/carrinho.html`, 'aria-label': `Abrir carrinho, ${initialCount} itens` }
    });
    const cartIcon = createElement('span', { text: '🛒', attrs: { 'aria-hidden': 'true' } });
    const cartCount = createElement('span', { className: 'cart-count', text: String(initialCount), attrs: { 'aria-hidden': 'true' } });
    cart.append(cartIcon, cartCount);

    const profile = createElement('a', {
        className: 'profile-btn',
        attrs: {
            href: isAuthenticated() ? `${root}/html/perfil.html` : `${root}/html/login.html`,
            'aria-label': isAuthenticated() ? 'Acessar perfil da conta' : 'Entrar na conta'
        }
    });
    profile.appendChild(createElement('span', { text: '👤', attrs: { 'aria-hidden': 'true' } }));
    actions.append(cart, profile);
    return actions;
}

function createFooterColumn(title, links) {
    const column = createElement('section', { className: 'footer__column' });
    const heading = createElement('h2', { text: title });
    const list = createElement('ul');
    links.forEach(({ label, href }) => {
        const item = createElement('li');
        item.appendChild(createElement('a', { text: label, attrs: { href } }));
        list.appendChild(item);
    });
    column.append(heading, list);
    return column;
}

function createFooterLinks(root) {
    const links = createElement('div', { className: 'footer__links' });
    const quick = [
        { label: 'Início', href: `${root}/index.html` }, { label: 'Catálogo', href: `${root}/html/catalogo.html` },
        { label: 'Criar leilão', href: `${root}/html/criar-leilao.html` }, { label: 'Carrinho', href: `${root}/html/carrinho.html` }
    ];
    const categories = [
        { label: 'Jogos Eletrônicos', href: `${root}/html/categoria.html?categoria=Jogos%20Eletrônicos` },
        { label: 'Cards Colecionáveis', href: `${root}/html/categoria.html?categoria=Cards%20Colecionáveis` },
        { label: 'Automóveis', href: `${root}/html/categoria.html?categoria=Automóveis` },
        { label: 'Itens Esportivos', href: `${root}/html/categoria.html?categoria=Itens%20Esportivos` }
    ];
    const account = [
        { label: 'Perfil', href: `${root}/html/perfil.html` }, { label: 'Configurações', href: `${root}/html/configuracoes.html` },
        { label: 'Meus Leilões', href: `${root}/html/meus-leiloes.html` }
    ];
    links.append(createFooterColumn('Acesso rápido', quick), createFooterColumn('Categorias', categories), createFooterColumn('Conta', account));
    return links;
}

function createFooterContent() {
    const root = document.body.dataset.root || '..';
    const fragment = document.createDocumentFragment();
    const content = createElement('div', { className: 'container footer__content' });
    const brand = createElement('div', { className: 'footer__brand' });
    brand.append(
        createElement('p', { className: 'logo--gold', text: 'MIDAS' }),
        createElement('button', { className: 'footer-feedback-button', text: 'Avaliar plataforma', attrs: { type: 'button' }, dataset: { openFeedback: 'true' } })
    );
    content.append(brand, createFooterLinks(root));
    const bottom = createElement('div', { className: 'footer__bottom' });
    bottom.appendChild(createElement('p', { text: '© 2026 Midas. Todos os direitos reservados.' }));
    fragment.append(content, bottom);
    return fragment;
}

function updateCartCount() {
    const count = document.querySelector('.cart-count');
    if (count) {
        const itemCount = getCartItemCount();
        count.textContent = String(itemCount);
        const cartLink = count.closest('.header-icon-link');
        cartLink?.setAttribute('aria-label', `Abrir carrinho, ${itemCount} itens`);
    }
}

export function initSiteChrome() {
    const headerSlot = document.querySelector('[data-site-header]');
    const footerSlot = document.querySelector('[data-site-footer]');
    if (headerSlot) {
        clearElement(headerSlot);
        headerSlot.appendChild(createHeaderContent());
    }
    if (footerSlot) {
        clearElement(footerSlot);
        footerSlot.appendChild(createFooterContent());
    }
    window.addEventListener('midas:cart-updated', updateCartCount);
}
