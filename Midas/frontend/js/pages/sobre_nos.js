import { appendChildren, clearElement, createElement } from '../components/dom.js';
import { renderState } from '../components/statusMessage.js';
import { getFeedbackHighlights } from '../services/feedbackService.js';
import { normalizeCollection } from '../services/api.js';

const grid = document.getElementById('testimonials-grid');

function createTestimonial(feedback) {
    const article = createElement('article', { className: 'testimonial-card' });
    const header = createElement('div', { className: 'testimonial-header' });
    const userInfo = createElement('div', { className: 'user-info' });
    const avatar = createElement('div', { className: 'user-avatar-placeholder', attrs: { 'aria-hidden': 'true' } });
    const userText = createElement('div');
    userText.append(
        createElement('h3', { className: 'user-name', text: feedback.anonymous ? 'Usuário anônimo' : feedback.userName || 'Usuário Midas' }),
        createElement('span', { className: 'user-role', text: feedback.role || 'Usuário da plataforma' })
    );
    userInfo.append(avatar, userText);
    const rating = Math.max(1, Math.min(5, Number(feedback.rating || 5)));
    const ratingElement = createElement('p', { className: 'rating', attrs: { 'aria-label': `Avaliação: ${rating} de 5 estrelas` } });
    ratingElement.appendChild(createElement('span', { text: '★'.repeat(rating) + '☆'.repeat(5 - rating), attrs: { 'aria-hidden': 'true' } }));
    appendChildren(header, [userInfo, ratingElement]);
    appendChildren(article, [header, createElement('p', { className: 'testimonial-text', text: feedback.comments || 'Avaliação sem comentário.' })]);
    return article;
}

async function loadTestimonials() {
    renderState(grid, 'loading', 'Carregando avaliações...');
    try {
        const feedbacks = normalizeCollection(await getFeedbackHighlights()).slice(0, 4);
        clearElement(grid);
        if (!feedbacks.length) {
            renderState(grid, 'empty', 'Ainda não há avaliações publicadas. Você pode enviar a primeira pelo botão “Avaliar plataforma”.');
            return;
        }
        feedbacks.forEach((feedback) => grid.appendChild(createTestimonial(feedback)));
    } catch (error) {
        renderState(grid, 'error', error.message);
    }
}

loadTestimonials();
