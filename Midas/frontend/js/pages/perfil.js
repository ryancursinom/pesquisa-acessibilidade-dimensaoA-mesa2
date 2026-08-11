import { clearFieldError, focusFirstInvalid, validateEmail, validatePassword, validateRequired } from '../components/formValidation.js';
import { closeDialog, initDialog, openDialog } from '../components/modal.js';
import { renderState, setLiveMessage } from '../components/statusMessage.js';
import { getUserErrorMessage } from '../components/userError.js';
import { logout } from '../services/authService.js';
import { t } from '../services/i18n.js';
import { getProfile, updatePassword, updateProfile, updateProfilePhoto } from '../services/userService.js';

const state = document.getElementById('profile-state');
const dataContainer = document.getElementById('profile-data');
const profileForm = document.getElementById('profile-form');
const passwordForm = document.getElementById('password-form');
const profileStatus = document.getElementById('profile-form-status');
const passwordStatus = document.getElementById('password-status');
const photoDialog = document.getElementById('profile-photo-dialog');
const photoEditButton = document.getElementById('profile-photo-edit');
const photoChooseButton = document.getElementById('profile-photo-choose');
const photoInput = document.getElementById('profile-photo');
const photoSaveButton = document.getElementById('profile-photo-save');
const photoStatus = document.getElementById('profile-photo-status');
const photoAnnouncement = document.getElementById('profile-photo-announcement');
const avatarInitials = document.getElementById('profile-avatar-initials');
const avatarImage = document.getElementById('profile-avatar-image');
const previewInitials = document.getElementById('profile-photo-preview-initials');
const previewImage = document.getElementById('profile-photo-preview-image');

let currentProfile = {};
let selectedPhoto = null;
let previewUrl = '';

function getInitials(name) {
    return String(name || 'M')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

function revokePreviewUrl() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = '';
}

function showAvatar(initialsElement, imageElement, url, name) {
    const hasImage = Boolean(url);
    initialsElement.hidden = hasImage;
    imageElement.hidden = !hasImage;
    initialsElement.textContent = getInitials(name);

    if (!hasImage) {
        imageElement.removeAttribute('src');
        imageElement.alt = '';
        return;
    }

    imageElement.src = url;
    imageElement.alt = t('Foto de perfil de {name}', { name: name || t('Usuário Midas') });
}

function renderProfile(profile) {
    currentProfile = profile;
    const name = profile.name || t('Usuário Midas');
    document.getElementById('profile-name-heading').textContent = name;
    document.getElementById('profile-location').textContent =
        [profile.city, profile.country].filter(Boolean).join(', ') || t('Localização não informada');

    showAvatar(avatarInitials, avatarImage, profile.imageUrl, name);
    document.getElementById('profile-name').value = profile.name || '';
    document.getElementById('profile-email').value = profile.email || '';
    document.getElementById('profile-city').value = profile.city || '';
    document.getElementById('profile-country').value = profile.country || '';
    dataContainer.hidden = false;
    state.textContent = '';
}

function resetPhotoDialog() {
    selectedPhoto = null;
    photoInput.value = '';
    photoSaveButton.disabled = true;
    revokePreviewUrl();
    setLiveMessage(photoStatus, '');
    showAvatar(previewInitials, previewImage, currentProfile.imageUrl, currentProfile.name);
}

function openPhotoDialog() {
    resetPhotoDialog();
    openDialog(photoDialog, photoEditButton);
}

function handlePhotoSelection() {
    const [file] = photoInput.files;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        setLiveMessage(photoStatus, t('Escolha um arquivo de imagem válido.'), true);
        return;
    }

    selectedPhoto = file;
    revokePreviewUrl();
    previewUrl = URL.createObjectURL(file);
    showAvatar(previewInitials, previewImage, previewUrl, currentProfile.name);
    photoSaveButton.disabled = false;
    setLiveMessage(photoStatus, t('Prévia pronta. Salve a foto para confirmar a alteração.'));
}

async function savePhoto() {
    if (!selectedPhoto) return;
    photoSaveButton.disabled = true;
    setLiveMessage(photoStatus, t('Salvando foto...'));

    try {
        await updateProfilePhoto(selectedPhoto);
        renderProfile(await getProfile());
        setLiveMessage(photoAnnouncement, t('Foto de perfil atualizada com sucesso.'));
        closeDialog(photoDialog);
    } catch (error) {
        setLiveMessage(photoStatus, getUserErrorMessage(
            error,
            t('Não conseguimos atualizar sua foto agora. Tente novamente em instantes.')
        ), true);
        photoSaveButton.disabled = false;
    }
}

function validateProfileForm() {
    const name = document.getElementById('profile-name');
    const email = document.getElementById('profile-email');
    const valid = validateRequired(name, t('Nome'))
        && validateRequired(email, t('E-mail'))
        && validateEmail(email);

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

initDialog(photoDialog);
profileForm.addEventListener('submit', saveProfile);
passwordForm.addEventListener('submit', savePassword);
photoEditButton.addEventListener('click', openPhotoDialog);
photoChooseButton.addEventListener('click', () => photoInput.click());
photoInput.addEventListener('change', handlePhotoSelection);
photoSaveButton.addEventListener('click', savePhoto);
photoDialog.addEventListener('close', resetPhotoDialog);
profileForm.querySelectorAll('input').forEach((field) => {
    field.addEventListener('input', () => clearFieldError(field));
});
passwordForm.querySelectorAll('input').forEach((field) => {
    field.addEventListener('input', () => clearFieldError(field));
});
document.getElementById('logout-button').addEventListener('click', () => {
    logout();
    window.location.href = 'login.html';
});
window.addEventListener('pagehide', revokePreviewUrl);

loadProfile();
