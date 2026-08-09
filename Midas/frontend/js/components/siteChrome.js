import { appendChildren, createElement, clearElement } from './dom.js';
import { createIcon } from './icons.js';
import { AUCTION_CATEGORIES } from './catalogConfig.js';
import { getCartItemCount } from '../services/cartService.js';
import { isAuthenticated } from '../services/authService.js';
import { t } from '../services/i18n.js';

function createNavLink(root, page, href, label, currentPage) {
    const link = createElement('a', { text: t(label), attrs: { href: `${root}/${href}` } });
    if (page === currentPage) link.setAttribute('aria-current', 'page');
    const item = createElement('li');
    item.appendChild(link);
    return item;
}

function createLogo(root, footer = false) {
    const link = createElement('a', {
        className: footer ? 'logo logo--footer' : 'logo',
        attrs: { href: `${root}/index.html`, 'aria-label': t('Ir para a página inicial do Midas') }
    });
    link.appendChild(createElement('img', {
        attrs: { src: `${root}/assets/img/logo.png`, alt: 'Midas' }
    }));
    return link;
}

function createHeaderActions(root) {
    const actions = createElement('div', { className: 'header-actions' });
    const initialCount = getCartItemCount();
    const cart = createElement('a', {
        className: 'header-icon-link',
        attrs: { href: `${root}/html/carrinho.html`, 'aria-label': t('Abrir carrinho, {count} itens', { count: initialCount }) }
    });
    const cartCount = createElement('span', {
        className: 'cart-count', text: String(initialCount), attrs: { 'aria-hidden': 'true' }
    });
    cart.append(createIcon('cart'), cartCount);

    const profile = createElement('a', {
        className: 'profile-btn',
        attrs: {
            href: isAuthenticated() ? `${root}/html/perfil.html` : `${root}/html/login.html`,
            'aria-label': t(isAuthenticated() ? 'Acessar perfil da conta' : 'Entrar na conta')
        }
    });
    profile.appendChild(createIcon('user'));
    actions.append(cart, profile);
    return actions;
}

function createHeaderContent() {
    const root = document.body.dataset.root || '..';
    const currentPage = document.body.dataset.page || '';
    const content = createElement('div', { className: 'container navbar__content' });
    const nav = createElement('nav', { className: 'nav-links', attrs: { 'aria-label': t('Navegação principal') } });
    const list = createElement('ul');
    const myAuctionsHref = isAuthenticated() ? 'html/meus-leiloes.html' : 'html/login.html';
    list.append(
        createNavLink(root, 'home', 'index.html', 'Home', currentPage),
        createNavLink(root, 'sobre', 'html/sobre_nos.html', 'Sobre Nós', currentPage),
        createNavLink(root, 'catalogo', 'html/catalogo.html', 'Catálogo', currentPage),
        createNavLink(root, 'meus-leiloes', myAuctionsHref, 'Meus Leilões', currentPage)
    );
    nav.appendChild(list);
    appendChildren(content, [createLogo(root), nav, createHeaderActions(root)]);
    return content;
}

function createFooterColumn(title, links) {
    const column = createElement('section', { className: 'footer__column' });
    const heading = createElement('h2', { text: t(title) });
    const list = createElement('ul');
    links.forEach(({ label, href }) => {
        const item = createElement('li');
        item.appendChild(createElement('a', { text: t(label), attrs: { href } }));
        list.appendChild(item);
    });
    column.append(heading, list);
    return column;
}

function createSocialItem(name, iconName, href = '') {
    if (href) {
        const link = createElement('a', {
            className: 'footer-social-link',
            attrs: { href, 'aria-label': name }
        });
        link.appendChild(createIcon(iconName));
        return link;
    }
    const item = createElement('span', {
        className: 'footer-social-link footer-social-link--disabled',
        attrs: { 'aria-label': t('{network} do Midas: link em breve', { network: name }), role: 'img' }
    });
    item.appendChild(createIcon(iconName));
    return item;
}

function createFooterBrand(root) {
    const brand = createElement('div', { className: 'footer__brand' });
    const socials = createElement('div', { className: 'footer-socials', attrs: { 'aria-label': t('Redes e contato do Midas') } });
    socials.append(
        createSocialItem('Instagram', 'instagram'),
        createSocialItem('Facebook', 'facebook'),
        createSocialItem(t('E-mail'), 'mail', 'mailto:midas.leiloes@gmail.com')
    );
    const feedback = createElement('button', {
        className: 'footer-feedback-button', text: t('Avaliar plataforma'),
        attrs: { type: 'button' }, dataset: { openFeedback: 'true' }
    });
    brand.append(createLogo(root, true), socials, feedback);
    return brand;
}

function createFooterLinks(root) {
    const links = createElement('div', { className: 'footer__links' });
    const quick = [
        { label: 'Criar leilão', href: isAuthenticated() ? `${root}/html/criar-leilao.html` : `${root}/html/login.html` },
        { label: 'Loja Oficial Midas', href: `${root}/html/loja-oficial.html` }
    ];
    const categories = AUCTION_CATEGORIES.map((category) => ({
        label: category,
        href: `${root}/html/categoria.html?categoria=${encodeURIComponent(category)}`
    }));
    const account = [
        { label: 'Perfil', href: isAuthenticated() ? `${root}/html/perfil.html` : `${root}/html/login.html` },
        { label: 'Configurações', href: `${root}/html/configuracoes.html` },
        { label: 'Meus Leilões', href: isAuthenticated() ? `${root}/html/meus-leiloes.html` : `${root}/html/login.html` }
    ];
    links.append(
        createFooterColumn('Acesso rápido', quick),
        createFooterColumn('Categorias', categories),
        createFooterColumn('Conta', account)
    );
    return links;
}

function createFooterContent() {
    const root = document.body.dataset.root || '..';
    const fragment = document.createDocumentFragment();
    const content = createElement('div', { className: 'container footer__content' });
    content.append(createFooterBrand(root), createFooterLinks(root));
    const bottom = createElement('div', { className: 'footer__bottom' });
    bottom.appendChild(createElement('p', { text: t('© 2026 Midas. Todos os direitos reservados.') }));
    fragment.append(content, bottom);
    return fragment;
}

function updateCartCount() {
    const count = document.querySelector('.cart-count');
    if (!count) return;
    const itemCount = getCartItemCount();
    count.textContent = String(itemCount);
    count.closest('.header-icon-link')?.setAttribute('aria-label', t('Abrir carrinho, {count} itens', { count: itemCount }));
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
