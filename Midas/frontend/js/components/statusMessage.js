import { createElement, clearElement } from './dom.js';

export function renderState(container, type, message) {
    clearElement(container);
    const state = createElement('p', {
        className: `${type}-state`,
        text: message,
        attrs: { role: type === 'error' ? 'alert' : 'status' }
    });
    container.appendChild(state);
    return state;
}

export function setLiveMessage(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle('form-status--error', isError);
    element.classList.toggle('form-status--success', !isError && Boolean(message));
}
