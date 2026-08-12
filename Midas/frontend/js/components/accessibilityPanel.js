import { createElement } from './dom.js';
import { createIcon } from './icons.js';
import { getSettings, resetSettings, saveSettings } from '../services/settingsService.js';
import { closeDialog, createDialogCloseButton, initDialog, openDialog } from './modal.js';
import { t } from '../services/i18n.js';

function createSelect(id, label, options, value) {
    const wrapper = createElement('div', { className: 'settings-field' });
    const labelElement = createElement('label', { text: t(label), attrs: { for: id } });
    const select = createElement('select', { attrs: { id, name: id } });
    options.forEach(([optionValue, text]) => {
        const option = createElement('option', { text: t(text), attrs: { value: optionValue } });
        option.selected = optionValue === value;
        select.appendChild(option);
    });
    wrapper.append(labelElement, select);
    return wrapper;
}

function createCheckbox(id, label, checked) {
    const wrapper = createElement('label', { className: 'checkbox-row', attrs: { for: id } });
    const input = createElement('input', { attrs: { id, name: id, type: 'checkbox' } });
    input.checked = checked;
    wrapper.append(input, createElement('span', { text: t(label) }));
    return wrapper;
}

function createPanelForm(settings) {
    const form = createElement('form', { className: 'accessibility-form' });
    form.append(
        createSelect('a11y-theme', 'Tema', [['dark', 'Escuro'], ['light', 'Claro']], settings.theme),
        createSelect('a11y-contrast', 'Contraste', [['normal', 'Normal'], ['high', 'Alto contraste']], settings.contrast),
        createSelect('a11y-font', 'Tamanho da fonte', [['small', 'Pequena'], ['medium', 'Média'], ['large', 'Grande'], ['xlarge', 'Muito grande']], settings.fontSize),
        createSelect('a11y-colors', 'Ajuste de cores', [['none', 'Padrão'], ['protanopia', 'Protanopia'], ['deuteranopia', 'Deuteranopia'], ['tritanopia', 'Tritanopia']], settings.colorVision),
        createCheckbox('a11y-motion', 'Reduzir animações', settings.reduceMotion)
    );
    const actions = createElement('div', { className: 'dialog-actions' });
    actions.append(
        createElement('button', { className: 'btn-secondary', text: t('Cancelar'), attrs: { type: 'button' }, dataset: { dialogClose: 'true' } }),
        createElement('button', { className: 'btn-secondary', text: t('Restaurar padrão'), attrs: { type: 'button' }, dataset: { resetA11y: 'true' } }),
        createElement('button', { className: 'btn-primary', text: t('Aplicar'), attrs: { type: 'submit' } })
    );
    form.appendChild(actions);
    return form;
}

function readForm(form) {
    return {
        theme: form.elements['a11y-theme'].value,
        contrast: form.elements['a11y-contrast'].value,
        fontSize: form.elements['a11y-font'].value,
        colorVision: form.elements['a11y-colors'].value,
        reduceMotion: form.elements['a11y-motion'].checked,
        language: getSettings().language
    };
}


export function initAccessibilityPanel() {
    const button = createElement('button', {
        className: 'accessibility-fab', attrs: { type: 'button', 'aria-label': t('Abrir painel de acessibilidade') }
    });
    button.appendChild(createIcon('accessibility', { size: 30 }));
    const dialog = createElement('dialog', {
        className: 'midas-dialog accessibility-dialog', attrs: { 'aria-labelledby': 'a11y-title' }
    });
    const title = createElement('h2', { text: t('Acessibilidade'), attrs: { id: 'a11y-title' } });
    const description = createElement('p', {
        text: t('Personalize a visualização. As preferências ficam salvas neste navegador.')
    });
    const form = createPanelForm(getSettings());
    dialog.append(createDialogCloseButton(t('Fechar')), title, description, form);
    document.body.append(button, dialog);
    initDialog(dialog);

    button.addEventListener('click', () => openDialog(dialog, button));
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        saveSettings(readForm(form));
        closeDialog(dialog);
    });
    form.querySelector('[data-reset-a11y]').addEventListener('click', () => {
        resetSettings();
        closeDialog(dialog);
        window.location.reload();
    });
}
