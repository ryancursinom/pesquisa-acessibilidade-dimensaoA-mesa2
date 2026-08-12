import { formatCurrency } from './dom.js';
import { t } from '../services/i18n.js';

export function setFieldError(field, message) {
    const errorId = field.getAttribute('aria-describedby');
    const ids = String(errorId || '').split(/\s+/).filter(Boolean);
    const errorElement = ids.map((id) => document.getElementById(id)).find((element) => element?.classList.contains('field-error'));
    field.setAttribute('aria-invalid', 'true');
    if (errorElement) errorElement.textContent = message;
}

export function clearFieldError(field) {
    const errorId = field.getAttribute('aria-describedby');
    const ids = String(errorId || '').split(/\s+/).filter(Boolean);
    const errorElement = ids.map((id) => document.getElementById(id)).find((element) => element?.classList.contains('field-error'));
    field.removeAttribute('aria-invalid');
    if (errorElement) errorElement.textContent = '';
}

export function validateRequired(field, label) {
    const isValid = Boolean(String(field.value || '').trim());
    if (!isValid) setFieldError(field, t('{label} é obrigatório.', { label: t(label) }));
    else clearFieldError(field);
    return isValid;
}

export function validateEmail(field) {
    const value = field.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!isValid) setFieldError(field, t('Informe um e-mail válido.'));
    else clearFieldError(field);
    return isValid;
}

export function validatePositiveNumber(field, label, minimum = 0) {
    const value = Number(field.value);
    const isValid = Number.isFinite(value) && value > minimum;
    if (!isValid) {
        setFieldError(field, t('{label} deve ser maior que {minimum}.', {
            label: t(label), minimum: minimum > 0 ? formatCurrency(minimum) : minimum
        }));
    } else clearFieldError(field);
    return isValid;
}

export function validatePassword(field, minimumLength = 8) {
    const isValid = field.value.length >= minimumLength;
    if (!isValid) setFieldError(field, t('A senha deve ter pelo menos {minimumLength} caracteres.', { minimumLength }));
    else clearFieldError(field);
    return isValid;
}

export function focusFirstInvalid(form) {
    form.querySelector('[aria-invalid="true"]')?.focus();
}
