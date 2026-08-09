import { createElement } from './dom.js';
import { createIcon } from './icons.js';
import { closeDialog, initDialog, openDialog } from './modal.js';
import { setLiveMessage } from './statusMessage.js';
import { getUserErrorMessage } from './userError.js';
import { submitFeedback } from '../services/feedbackService.js';
import { t } from '../services/i18n.js';

function createRatingFieldset() {
    const fieldset = createElement('fieldset', { className: 'rating-fieldset' });
    fieldset.appendChild(createElement('legend', { text: t('Sua avaliação') }));
    const group = createElement('div', { className: 'rating-options' });
    for (let rating = 1; rating <= 5; rating += 1) {
        const inputId = `feedback-rating-${rating}`;
        const label = createElement('label', { className: 'rating-option', attrs: { for: inputId }, dataset: { ratingValue: String(rating) } });
        const input = createElement('input', {
            attrs: { id: inputId, type: 'radio', name: 'rating', value: rating, required: 'required', 'aria-label': t('{rating} de 5 estrelas', { rating }) }
        });
        const icon = createIcon('star', { size: 28 });
        label.append(input, icon);
        group.appendChild(label);
    }
    group.addEventListener('change', (event) => {
        const selected = event.target.closest('input[name="rating"]');
        if (selected) updateRatingVisuals(group, selected.value);
    });
    fieldset.appendChild(group);
    return fieldset;
}

function updateRatingVisuals(group, selectedRating = 0) {
    group.querySelectorAll('.rating-option').forEach((option) => {
        const isActive = Number(option.dataset.ratingValue) <= Number(selectedRating);
        option.classList.toggle('rating-option--active', isActive);
    });
}

function createFeedbackForm() {
    const form = createElement('form', { className: 'feedback-form' });
    const commentsLabel = createElement('label', { text: t('Comentários do feedback'), attrs: { for: 'feedback-comments' } });
    const comments = createElement('textarea', {
        attrs: { id: 'feedback-comments', name: 'comments', maxlength: 200, rows: 5, placeholder: t('Descreva a sua experiência...') }
    });
    const anonymous = createElement('label', { className: 'checkbox-row', attrs: { for: 'feedback-anonymous' } });
    anonymous.append(
        createElement('input', { attrs: { id: 'feedback-anonymous', type: 'checkbox', name: 'anonymous' } }),
        createElement('span', { text: t('Deixar anônimo') })
    );
    const status = createElement('p', { className: 'form-status', attrs: { role: 'status', 'aria-live': 'polite' } });
    const actions = createElement('div', { className: 'dialog-actions' });
    actions.append(
        createElement('button', { className: 'btn-secondary', text: t('Cancelar'), attrs: { type: 'button' }, dataset: { dialogClose: 'true' } }),
        createElement('button', { className: 'btn-primary', text: t('Enviar'), attrs: { type: 'submit' } })
    );
    form.append(createRatingFieldset(), commentsLabel, comments, anonymous, status, actions);
    return form;
}

function createCloseButton() {
    const button = createElement('button', {
        className: 'dialog-close-button', attrs: { type: 'button', 'aria-label': t('Fechar') }, dataset: { dialogClose: 'true' }
    });
    button.appendChild(createIcon('x'));
    return button;
}

async function handleSubmit(event, dialog) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector('.form-status');
    const submitButton = form.querySelector('[type="submit"]');
    const data = new FormData(form);
    submitButton.disabled = true;
    setLiveMessage(status, t('Enviando avaliação...'));
    try {
        await submitFeedback({
            rating: Number(data.get('rating')),
            comments: data.get('comments'),
            anonymous: data.get('anonymous') === 'on'
        });
        setLiveMessage(status, t('Obrigado pelo seu feedback!'));
        form.reset();
        updateRatingVisuals(form.querySelector('.rating-options'));
        window.setTimeout(() => closeDialog(dialog), 600);
    } catch (error) {
        setLiveMessage(status, getUserErrorMessage(error, t('Não conseguimos enviar sua avaliação agora. Tente novamente em instantes.')), true);
    } finally {
        submitButton.disabled = false;
    }
}

export function initFeedbackModal() {
    const dialog = createElement('dialog', {
        className: 'midas-dialog feedback-dialog', attrs: { 'aria-labelledby': 'feedback-title' }
    });
    dialog.append(
        createCloseButton(),
        createElement('h2', { text: t('Dê-nos o seu feedback'), attrs: { id: 'feedback-title' } }),
        createElement('p', { text: t('Avalie como é sua experiência na nossa plataforma.') })
    );
    const form = createFeedbackForm();
    dialog.appendChild(form);
    document.body.appendChild(dialog);
    initDialog(dialog);
    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-open-feedback]');
        if (trigger) openDialog(dialog, trigger);
    });
    form.addEventListener('submit', (event) => handleSubmit(event, dialog));
}
