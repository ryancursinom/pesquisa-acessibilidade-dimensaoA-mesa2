import { clearFieldError, focusFirstInvalid, validateEmail, validatePassword, validateRequired } from '../components/formValidation.js';
import { renderState, setLiveMessage } from '../components/statusMessage.js';
import { getUserErrorMessage } from '../components/userError.js';
import { logout } from '../services/authService.js';
import { t } from '../services/i18n.js';
import { getProfile, updatePassword, updateProfile } from '../services/userService.js';

const state = document.getElementById('profile-state');
const dataContainer = document.getElementById('profile-data');
const profileForm = document.getElementById('profile-form');
const passwordForm = document.getElementById('password-form');
const profileStatus = document.getElementById('profile-form-status');
const passwordStatus = document.getElementById('password-status');

function getInitials(name) {
    return String(name || 'M').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}


function renderProfile(profile) {
    document.getElementById('profile-name-heading').textContent = profile.name || t('Usuário Midas');
    document.getElementById('profile-location').textContent = [profile.city, profile.country].filter(Boolean).join(', ') || t('Localização não informada');
    document.getElementById('profile-avatar').textContent = getInitials(profile.name);
    document.getElementById('profile-name').value = profile.name || '';
    document.getElementById('profile-email').value = profile.email || '';
    document.getElementById('profile-city').value = profile.city || '';
    document.getElementById('profile-country').value = profile.country || '';
    dataContainer.hidden = false;
    state.textContent = '';
}

function validateProfileForm() {
    const name = document.getElementById('profile-name');
    const email = document.getElementById('profile-email');
    const valid = validateRequired(name, t('Nome')) && validateRequired(email, t('E-mail')) && validateEmail(email);
    if (!valid) focusFirstInvalid(profileForm);
    return valid;
}

async function saveProfile(event) {
    event.preventDefault();
    if (!validateProfileForm()) return;
    const submitButton = profileForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    setLiveMessage(profileStatus, t('Salvando alterações...'));
    try {
        renderProfile(await updateProfile(Object.fromEntries(new FormData(profileForm))));
        setLiveMessage(profileStatus, t('Perfil atualizado com sucesso.'));
    } catch (error) {
        setLiveMessage(profileStatus, getUserErrorMessage(error), true);
    } finally {
        submitButton.disabled = false;
    }
}

function validatePasswordForm() {
    const current = document.getElementById('current-password');
    const next = document.getElementById('new-password');
    const valid = validateRequired(current, t('Senha atual')) && validatePassword(next);
    if (!valid) focusFirstInvalid(passwordForm);
    return valid;
}

async function savePassword(event) {
    event.preventDefault();
    if (!validatePasswordForm()) return;
    const submitButton = passwordForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    setLiveMessage(passwordStatus, t('Atualizando senha...'));
    try {
        await updatePassword(Object.fromEntries(new FormData(passwordForm)));
        passwordForm.reset();
        setLiveMessage(passwordStatus, t('Senha atualizada com sucesso.'));
    } catch (error) {
        setLiveMessage(passwordStatus, getUserErrorMessage(error), true);
    } finally {
        submitButton.disabled = false;
    }
}

async function loadProfile() {
    renderState(state, 'loading', t('Carregando perfil...'));
    try {
        renderProfile(await getProfile());
    } catch (error) {
        renderState(state, 'error', `${getUserErrorMessage(error)} ${t('Entre novamente para acessar sua conta.')}`);
    }
}

profileForm.addEventListener('submit', saveProfile);
passwordForm.addEventListener('submit', savePassword);
profileForm.querySelectorAll('input').forEach((field) => field.addEventListener('input', () => clearFieldError(field)));
passwordForm.querySelectorAll('input').forEach((field) => field.addEventListener('input', () => clearFieldError(field)));
document.getElementById('logout-button').addEventListener('click', () => {
    logout();
    window.location.href = 'login.html';
});
loadProfile();
