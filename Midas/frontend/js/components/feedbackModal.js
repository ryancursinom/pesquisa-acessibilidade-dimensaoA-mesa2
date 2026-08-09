import { createElement } from './dom.js';
import { closeDialog, initDialog, openDialog } from './modal.js';
import { setLiveMessage } from './statusMessage.js';
import { submitFeedback } from '../services/feedbackService.js';

function createRatingFieldset() {
    const fieldset = createElement('fieldset', { className: 'rating-fieldset' });
    fieldset.appendChild(createElement('legend', { text: 'Sua avaliação' }));
    const group = createElement('div', { className: 'rating-options' });
    for (let rating = 1; rating <= 5; rating += 1) {
        const label = createElement('label', { className: 'rating-option' });
        const input = createElement('input', { attrs: { type: 'radio', name: 'rating', value: rating, required: 'required' } });
        const star = createElement('span', { text: '★', attrs: { 'aria-hidden': 'true' } });
        label.append(input, star, createElement('span', { className: 'sr-only', text: `${rating} de 5 estrelas` }));
        group.appendChild(label);
    }
    fieldset.appendChild(group);
    return fieldset;
}

function createFeedbackForm() {
    const form = createElement('form', { className: 'feedback-form' });
    const commentsLabel = createElement('label', { text: 'Comentários do feedback', attrs: { for: 'feedback-comments' } });
    const comments = createElement('textarea', {
        attrs: { id: 'feedback-comments', name: 'comments', maxlength: 200, rows: 5, placeholder: 'Descreva a sua experiência...' }
    });
    const anonymous = createElement('label', { className: 'checkbox-row' });
    anonymous.append(
        createElement('input', { attrs: { type: 'checkbox', name: 'anonymous' } }),
        createElement('span', { text: 'Deixar anônimo' })
    );
    const status = createElement('p', { className: 'form-status', attrs: { role: 'status', 'aria-live': 'polite' } });
    const actions = createElement('div', { className: 'dialog-actions' });
    actions.append(
        createElement('button', { className: 'btn-secondary', text: 'Cancelar', attrs: { type: 'button' }, dataset: { dialogClose: 'true' } }),
        createElement('button', { className: 'btn-primary', text: 'Enviar', attrs: { type: 'submit' } })
    );
    form.append(createRatingFieldset(), commentsLabel, comments, anonymous, status, actions);
    return form;
}

async function handleSubmit(event, dialog) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector('.form-status');
    const submitButton = form.querySelector('[type="submit"]');
    const data = new FormData(form);
    submitButton.disabled = true;
    setLiveMessage(status, 'Enviando avaliação...');
    try {
        await submitFeedback({ rating: Number(data.get('rating')), comments: data.get('comments'), anonymous: data.get('anonymous') === 'on' });
        setLiveMessage(status, 'Obrigado pelo seu feedback!');
        form.reset();
        window.setTimeout(() => closeDialog(dialog), 600);
    } catch (error) {
        setLiveMessage(status, error.message, true);
    } finally {
        submitButton.disabled = false;
    }
}

export function initFeedbackModal() {
    const dialog = createElement('dialog', { className: 'midas-dialog feedback-dialog', attrs: { 'aria-labelledby': 'feedback-title' } });
    dialog.append(
        createElement('h2', { text: 'Dê-nos o seu feedback', attrs: { id: 'feedback-title' } }),
        createElement('p', { text: 'Avalie como é sua experiência na nossa plataforma.' })
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
