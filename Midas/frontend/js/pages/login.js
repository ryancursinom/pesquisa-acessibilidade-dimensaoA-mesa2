import { clearFieldError, focusFirstInvalid, validateEmail, validateRequired } from '../components/formValidation.js';
import { setLiveMessage } from '../components/statusMessage.js';
import { getUserErrorMessage } from '../components/userError.js';
import { login } from '../services/authService.js';
import { t } from '../services/i18n.js';

const form = document.getElementById('login-form');
const email = document.getElementById('login-email');
const password = document.getElementById('login-password');
const status = document.getElementById('login-status');

function validateForm() {
    const emailValid = validateRequired(email, t('E-mail')) && validateEmail(email);
    const passwordValid = validateRequired(password, t('Senha'));
    if (!emailValid || !passwordValid) focusFirstInvalid(form);
    return emailValid && passwordValid;
}

async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    setLiveMessage(status, t('Entrando...'));
    try {
        await login({ email: email.value.trim(), password: password.value });
        setLiveMessage(status, t('Login realizado. Redirecionando...'));
        window.location.href = 'perfil.html';
    } catch (error) {
        setLiveMessage(status, getUserErrorMessage(error, t('Não conseguimos entrar na sua conta agora. Confira seus dados e tente novamente.')), true);
    } finally {
        submitButton.disabled = false;
    }
}

email.addEventListener('input', () => clearFieldError(email));
password.addEventListener('input', () => clearFieldError(password));
form.addEventListener('submit', handleSubmit);
