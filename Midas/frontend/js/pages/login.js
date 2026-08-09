import { clearFieldError, focusFirstInvalid, validateEmail, validateRequired } from '../components/formValidation.js';
import { setLiveMessage } from '../components/statusMessage.js';
import { login } from '../services/authService.js';

const form = document.getElementById('login-form');
const email = document.getElementById('login-email');
const password = document.getElementById('login-password');
const status = document.getElementById('login-status');

function validateForm() {
    const emailValid = validateRequired(email, 'E-mail') && validateEmail(email);
    const passwordValid = validateRequired(password, 'Senha');
    if (!emailValid || !passwordValid) focusFirstInvalid(form);
    return emailValid && passwordValid;
}

async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    setLiveMessage(status, 'Entrando...');
    try {
        await login({ email: email.value.trim(), password: password.value });
        setLiveMessage(status, 'Login realizado. Redirecionando...');
        window.location.href = 'perfil.html';
    } catch (error) {
        setLiveMessage(status, error.message, true);
    } finally {
        submitButton.disabled = false;
    }
}

email.addEventListener('input', () => clearFieldError(email));
password.addEventListener('input', () => clearFieldError(password));
form.addEventListener('submit', handleSubmit);
