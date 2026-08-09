let lastTrigger = null;

function restoreFocus() {
    if (lastTrigger instanceof HTMLElement) lastTrigger.focus();
    lastTrigger = null;
}

export function openDialog(dialog, trigger = document.activeElement) {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    lastTrigger = trigger instanceof HTMLElement ? trigger : null;
    dialog.showModal();
    const firstFocusable = dialog.querySelector('button, [href], input, select, textarea');
    firstFocusable?.focus();
}

export function closeDialog(dialog) {
    if (!dialog?.open) return;
    dialog.close();
}

export function initDialog(dialog) {
    if (!dialog) return;
    dialog.addEventListener('close', restoreFocus);
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closeDialog(dialog);
    });
    dialog.querySelectorAll('[data-dialog-close]').forEach((button) => {
        button.addEventListener('click', () => closeDialog(dialog));
    });
}
