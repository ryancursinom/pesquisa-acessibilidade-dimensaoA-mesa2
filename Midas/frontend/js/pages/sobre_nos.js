import { appendChildren, clearElement, createElement } from '../components/dom.js';
import { createIcon } from '../components/icons.js';
import { renderState } from '../components/statusMessage.js';
import { getUserErrorMessage } from '../components/userError.js';
import { normalizeCollection } from '../services/api.js';
import { getFeedbackHighlights } from '../services/feedbackService.js';
import { t } from '../services/i18n.js';

const grid = document.getElementById('testimonials-grid');

function createRating(rating) {
    const ratingElement = createElement('p', {
        className: 'rating',
        attrs: { 'aria-label': t('Avaliação: {rating} de 5 estrelas', { rating }) }
    });
    const stars = createElement('span', { className: 'rating-stars', attrs: { 'aria-hidden': 'true' } });
    for (let index = 1; index <= 5; index += 1) {
        stars.appendChild(createIcon('star', { size: 19, filled: index <= rating }));
    }
    ratingElement.appendChild(stars);
    return ratingElement;
}

function createTestimonial(feedback) {
    const article = createElement('article', { className: 'testimonial-card' });
    const header = createElement('div', { className: 'testimonial-header' });
    const userInfo = createElement('div', { className: 'user-info' });
    const avatar = createElement('div', { className: 'user-avatar-placeholder', attrs: { 'aria-hidden': 'true' } });
    const userText = createElement('div');
    userText.append(
        createElement('h3', { className: 'user-name', text: feedback.anonymous ? t('Usuário anônimo') : feedback.userName || t('Usuário Midas') }),
        createElement('span', { className: 'user-role', text: feedback.role || t('Usuário da plataforma') })
    );
    userInfo.append(avatar, userText);
    const rating = Math.max(1, Math.min(5, Number(feedback.rating || 5)));
    appendChildren(header, [userInfo, createRating(rating)]);
    appendChildren(article, [header, createElement('p', { className: 'testimonial-text', text: feedback.comments || t('Avaliação sem comentário.') })]);
    return article;
}

async function loadTestimonials() {
    renderState(grid, 'loading', t('Carregando avaliações...'));
    try {
        const feedbacks = normalizeCollection(await getFeedbackHighlights()).slice(0, 4);
        clearElement(grid);
        if (!feedbacks.length) {
            renderState(grid, 'empty', t('Ainda não há avaliações publicadas. Você pode enviar a primeira pelo botão “Avaliar plataforma”.'));
            return;
        }
        feedbacks.forEach((feedback) => grid.appendChild(createTestimonial(feedback)));
    } catch (error) {
        renderState(grid, 'error', getUserErrorMessage(error, t('Não conseguimos carregar as avaliações agora. Tente novamente em instantes.')));
    }
}

loadTestimonials();
