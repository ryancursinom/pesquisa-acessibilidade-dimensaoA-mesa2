export function setFieldError(field, message) {
    const errorId = field.getAttribute('aria-describedby');
    const errorElement = errorId ? document.getElementById(errorId) : null;
    field.setAttribute('aria-invalid', 'true');
    if (errorElement) errorElement.textContent = message;
}

export function clearFieldError(field) {
    const errorId = field.getAttribute('aria-describedby');
    const errorElement = errorId ? document.getElementById(errorId) : null;
    field.removeAttribute('aria-invalid');
    if (errorElement) errorElement.textContent = '';
}

export function validateRequired(field, label) {
    const isValid = Boolean(field.value.trim());
    if (!isValid) setFieldError(field, `${label} é obrigatório.`);
    else clearFieldError(field);
    return isValid;
}

export function validateEmail(field) {
    const value = field.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!isValid) setFieldError(field, 'Informe um e-mail válido.');
    else clearFieldError(field);
    return isValid;
}

export function validatePositiveNumber(field, label, minimum = 0) {
    const value = Number(field.value);
    const isValid = Number.isFinite(value) && value > minimum;
    if (!isValid) setFieldError(field, `${label} deve ser maior que ${minimum}.`);
    else clearFieldError(field);
    return isValid;
}

export function validatePassword(field, minimumLength = 8) {
    const isValid = field.value.length >= minimumLength;
    if (!isValid) setFieldError(field, `A senha deve ter pelo menos ${minimumLength} caracteres.`);
    else clearFieldError(field);
    return isValid;
}

export function focusFirstInvalid(form) {
    const invalidField = form.querySelector('[aria-invalid="true"]');
    invalidField?.focus();
}
