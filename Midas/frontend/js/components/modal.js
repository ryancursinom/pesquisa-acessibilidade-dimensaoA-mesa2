import { createElement } from './dom.js';
import { createIcon } from './icons.js';

const triggerByDialog = new WeakMap();
const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function restoreFocus(dialog) {
    const trigger = triggerByDialog.get(dialog);
    if (trigger instanceof HTMLElement && document.contains(trigger)) trigger.focus();
    triggerByDialog.delete(dialog);
}

function getFocusableElements(dialog) {
    return [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)].filter((element) => !element.hidden && element.getClientRects().length > 0);
}

function trapFocus(event, dialog) {
    if (event.key !== 'Tab') return;
    const focusable = getFocusableElements(dialog);
    if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function ensureSurface(dialog) {
    let surface = dialog.querySelector(':scope > .dialog-surface');
    if (surface) return surface;
    surface = document.createElement('div');
    surface.className = 'dialog-surface';
    while (dialog.firstChild) surface.appendChild(dialog.firstChild);
    dialog.appendChild(surface);
    surface.addEventListener('click', (event) => event.stopPropagation());
    return surface;
}

export function openDialog(dialog, trigger = document.activeElement) {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    triggerByDialog.set(dialog, trigger instanceof HTMLElement ? trigger : null);
    dialog.showModal();
    const firstFocusable = getFocusableElements(dialog)[0];
    (firstFocusable || dialog).focus();
}

export function closeDialog(dialog) {
    if (dialog?.open) dialog.close();
}

export function initDialog(dialog) {
    if (!dialog) return;
    ensureSurface(dialog);
    dialog.setAttribute('tabindex', '-1');
    dialog.setAttribute('aria-modal', 'true');
    dialog.addEventListener('close', () => restoreFocus(dialog));
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener('keydown', (event) => trapFocus(event, dialog));
    dialog.querySelectorAll('[data-dialog-close]').forEach((button) => {
        button.addEventListener('click', () => closeDialog(dialog));
    });
}


export function createDialogCloseButton(label) {
    const button = createElement('button', {
        className: 'dialog-close-button',
        attrs: { type: 'button', 'aria-label': label },
        dataset: { dialogClose: 'true' }
    });
    button.appendChild(createIcon('x'));
    return button;
}
