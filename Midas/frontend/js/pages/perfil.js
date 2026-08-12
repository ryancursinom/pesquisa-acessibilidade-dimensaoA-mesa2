import { limparErroCampo, focarPrimeiroCampoInvalido, validarCampoTelefoneBrasileiro, validarEmail, validarSenha, validarCampoObrigatorio } from '../components/formValidation.js';
import { fecharDialogo, inicializarDialogo, abrirDialogo } from '../components/modal.js';
import { aplicarMascaraTelefone, formatarTelefoneBrasileiro, obterDigitosTelefone } from '../components/phone.js';
import { exigirAutenticacao } from '../components/privatePageGuard.js';
import { renderizarEstado, definirMensagemAoVivo } from '../components/statusMessage.js';
import { obterMensagemErroUsuario } from '../components/userError.js';
import { encerrarSessao } from '../services/authService.js';
import { traduzir } from '../services/i18n.js';
import { obterPerfil, atualizarSenha, atualizarPerfil, atualizarFotoPerfil } from '../services/userService.js';

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
const phoneField = document.getElementById('profile-phone');
const canInitializePage = exigirAutenticacao();

let currentProfile = {};
let selectedPhoto = null;
let previewUrl = '';

function obterIniciais(name) {
    return String(name || 'M')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

function revogarUrlPrevia() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = '';
}

function exibirAvatar(initialsElement, imageElement, url, name) {
    const hasImage = Boolean(url);
    initialsElement.hidden = hasImage;
    imageElement.hidden = !hasImage;
    initialsElement.textContent = obterIniciais(name);

    if (!hasImage) {
        imageElement.removeAttribute('src');
        imageElement.alt = '';
        return;
    }

    imageElement.src = url;
    imageElement.alt = traduzir('Foto de perfil de {name}', { name: name || traduzir('Usuário Midas') });
}

function renderizarPerfil(profile) {
    currentProfile = profile;
    const name = profile.name || traduzir('Usuário Midas');
    document.getElementById('profile-name-heading').textContent = name;
    document.getElementById('profile-location').textContent =
        [profile.city, profile.country].filter(Boolean).join(', ') || traduzir('Localização não informada');

    exibirAvatar(avatarInitials, avatarImage, profile.imageUrl, name);
    document.getElementById('profile-name').value = profile.name || '';
    document.getElementById('profile-email').value = profile.email || '';
    phoneField.value = formatarTelefoneBrasileiro(profile.phone);
    document.getElementById('profile-city').value = profile.city || '';
    document.getElementById('profile-country').value = profile.country || '';
    dataContainer.hidden = false;
    state.textContent = '';
}

function redefinirDialogoFoto() {
    selectedPhoto = null;
    photoInput.value = '';
    photoSaveButton.disabled = true;
    revogarUrlPrevia();
    definirMensagemAoVivo(photoStatus, '');
    exibirAvatar(previewInitials, previewImage, currentProfile.imageUrl, currentProfile.name);
}

function abrirDialogoFoto() {
    redefinirDialogoFoto();
    abrirDialogo(photoDialog, photoEditButton);
}

function selecionarFotoPerfil() {
    const [file] = photoInput.files;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        definirMensagemAoVivo(photoStatus, traduzir('Escolha um arquivo de imagem válido.'), true);
        return;
    }

    selectedPhoto = file;
    revogarUrlPrevia();
    previewUrl = URL.createObjectURL(file);
    exibirAvatar(previewInitials, previewImage, previewUrl, currentProfile.name);
    photoSaveButton.disabled = false;
    definirMensagemAoVivo(photoStatus, traduzir('Prévia pronta. Salve a foto para confirmar a alteração.'));
}

async function salvarFotoPerfil() {
    if (!selectedPhoto) return;
    photoSaveButton.disabled = true;
    definirMensagemAoVivo(photoStatus, traduzir('Salvando foto...'));

    try {
        await atualizarFotoPerfil(selectedPhoto);
        renderizarPerfil(await obterPerfil());
        definirMensagemAoVivo(photoAnnouncement, traduzir('Foto de perfil atualizada com sucesso.'));
        fecharDialogo(photoDialog);
    } catch (error) {
        definirMensagemAoVivo(photoStatus, obterMensagemErroUsuario(
            error,
            traduzir('Não conseguimos atualizar sua foto agora. Tente novamente em instantes.')
        ), true);
        photoSaveButton.disabled = false;
    }
}

function validarFormularioPerfil() {
    const name = document.getElementById('profile-name');
    const email = document.getElementById('profile-email');
    const valid = validarCampoObrigatorio(name, traduzir('Nome'))
        && validarCampoObrigatorio(email, traduzir('E-mail'))
        && validarEmail(email)
        && validarCampoTelefoneBrasileiro(phoneField);

    if (!valid) focarPrimeiroCampoInvalido(profileForm);
    return valid;
}

async function salvarPerfil(event) {
    event.preventDefault();
    if (!validarFormularioPerfil()) return;

    const submitButton = profileForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    definirMensagemAoVivo(profileStatus, traduzir('Salvando alterações...'));

    try {
        const profileData = Object.fromEntries(new FormData(profileForm));
        profileData.phone = obterDigitosTelefone(profileData.phone);
        renderizarPerfil(await atualizarPerfil(profileData));
        definirMensagemAoVivo(profileStatus, traduzir('Perfil atualizado com sucesso.'));
    } catch (error) {
        definirMensagemAoVivo(profileStatus, obterMensagemErroUsuario(error), true);
    } finally {
        submitButton.disabled = false;
    }
}

function validarFormularioSenha() {
    const current = document.getElementById('current-password');
    const next = document.getElementById('new-password');
    const valid = validarCampoObrigatorio(current, traduzir('Senha atual')) && validarSenha(next);
    if (!valid) focarPrimeiroCampoInvalido(passwordForm);
    return valid;
}

async function salvarSenha(event) {
    event.preventDefault();
    if (!validarFormularioSenha()) return;

    const submitButton = passwordForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    definirMensagemAoVivo(passwordStatus, traduzir('Atualizando senha...'));

    try {
        await atualizarSenha(Object.fromEntries(new FormData(passwordForm)));
        passwordForm.reset();
        definirMensagemAoVivo(passwordStatus, traduzir('Senha atualizada com sucesso.'));
    } catch (error) {
        definirMensagemAoVivo(passwordStatus, obterMensagemErroUsuario(error), true);
    } finally {
        submitButton.disabled = false;
    }
}

async function carregarPerfil() {
    renderizarEstado(state, 'loading', traduzir('Carregando perfil...'));
    try {
        renderizarPerfil(await obterPerfil());
    } catch (error) {
        renderizarEstado(state, 'error', `${obterMensagemErroUsuario(error)} ${traduzir('Entre novamente para acessar sua conta.')}`);
    }
}

if (canInitializePage) {
    inicializarDialogo(photoDialog);
    profileForm.addEventListener('submit', salvarPerfil);
    passwordForm.addEventListener('submit', salvarSenha);
    photoEditButton.addEventListener('click', abrirDialogoFoto);
    photoChooseButton.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', selecionarFotoPerfil);
    photoSaveButton.addEventListener('click', salvarFotoPerfil);
    photoDialog.addEventListener('close', redefinirDialogoFoto);
    profileForm.querySelectorAll('input').forEach((field) => {
        field.addEventListener('input', () => limparErroCampo(field));
    });
    phoneField.addEventListener('input', () => aplicarMascaraTelefone(phoneField));
    passwordForm.querySelectorAll('input').forEach((field) => {
        field.addEventListener('input', () => limparErroCampo(field));
    });
    document.getElementById('logout-button').addEventListener('click', () => {
        encerrarSessao();
        window.location.href = 'login.html';
    });
    window.addEventListener('pagehide', revogarUrlPrevia);

    carregarPerfil();
}
