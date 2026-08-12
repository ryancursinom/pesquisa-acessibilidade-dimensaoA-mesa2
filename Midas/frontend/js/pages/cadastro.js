import { clearFieldError, focusFirstInvalid, setFieldError, validateEmail, validatePassword, validateRequired } from '../components/formValidation.js';
import { setLiveMessage } from '../components/statusMessage.js';
import { getUserErrorMessage } from '../components/userError.js';
import { register } from '../services/authService.js';
import { t } from '../services/i18n.js';

const form = document.getElementById('register-form');
const nameField = document.getElementById('register-name');
const emailField = document.getElementById('register-email');
const passwordField = document.getElementById('register-password');
const confirmField = document.getElementById('register-confirm-password');
const termsField = document.getElementById('register-terms');
const status = document.getElementById('register-status');

function validatePasswordConfirmation() {
    const valid = confirmField.value === passwordField.value && Boolean(confirmField.value);
    if (!valid) setFieldError(confirmField, t('As senhas precisam ser iguais.'));
    else clearFieldError(confirmField);
    return valid;
}

function validateTerms() {
    const valid = termsField.checked;
    if (!valid) setFieldError(termsField, t('Aceite os termos para continuar.'));
    else clearFieldError(termsField);
    return valid;
}

function validateForm() {
    const checks = [
        validateRequired(nameField, t('Nome')),
        validateRequired(emailField, t('E-mail')) && validateEmail(emailField),
        validatePassword(passwordField),
        validatePasswordConfirmation(),
        validateTerms()
    ];
    if (checks.includes(false)) focusFirstInvalid(form);
    return checks.every(Boolean);
}

async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    setLiveMessage(status, t('Criando conta...'));
    try {
        const result = await register({ name: nameField.value.trim(), email: emailField.value.trim(), password: passwordField.value });
        setLiveMessage(status, t('Conta criada com sucesso. Redirecionando...'));
        window.location.href = result?.token || result?.accessToken ? 'perfil.html' : 'login.html';
    } catch (error) {
        setLiveMessage(status, getUserErrorMessage(error, t('Não conseguimos criar sua conta agora. Revise os dados e tente novamente.')), true);
    } finally {
        submitButton.disabled = false;
    }
}

[nameField, emailField, passwordField, confirmField, termsField].forEach((field) => {
    field.addEventListener('input', () => clearFieldError(field));
    field.addEventListener('change', () => clearFieldError(field));
});
form.addEventListener('submit', handleSubmit);
