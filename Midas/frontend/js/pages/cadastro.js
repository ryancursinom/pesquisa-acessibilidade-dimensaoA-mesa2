import { limparErroCampo, focarPrimeiroCampoInvalido, definirErroCampo, validarCampoTelefoneBrasileiro, validarEmail, validarSenha, validarCampoObrigatorio } from '../components/formValidation.js';
import { aplicarMascaraTelefone, obterDigitosTelefone } from '../components/phone.js';
import { definirMensagemAoVivo } from '../components/statusMessage.js';
import { obterMensagemErroUsuario } from '../components/userError.js';
import { cadastrarUsuario } from '../services/authService.js';
import { traduzir } from '../services/i18n.js';

const form = document.getElementById('register-form');
const nameField = document.getElementById('register-name');
const emailField = document.getElementById('register-email');
const phoneField = document.getElementById('register-phone');
const passwordField = document.getElementById('register-password');
const confirmField = document.getElementById('register-confirm-password');
const termsField = document.getElementById('register-terms');
const status = document.getElementById('register-status');

function validarConfirmacaoSenha() {
    const valid = confirmField.value === passwordField.value && Boolean(confirmField.value);
    if (!valid) definirErroCampo(confirmField, traduzir('As senhas precisam ser iguais.'));
    else limparErroCampo(confirmField);
    return valid;
}

function validarTermos() {
    const valid = termsField.checked;
    if (!valid) definirErroCampo(termsField, traduzir('Aceite os termos para continuar.'));
    else limparErroCampo(termsField);
    return valid;
}

function validarFormularioCadastro() {
    const checks = [
        validarCampoObrigatorio(nameField, traduzir('Nome')),
        validarCampoObrigatorio(emailField, traduzir('E-mail')) && validarEmail(emailField),
        validarCampoTelefoneBrasileiro(phoneField),
        validarSenha(passwordField),
        validarConfirmacaoSenha(),
        validarTermos()
    ];
    if (checks.includes(false)) focarPrimeiroCampoInvalido(form);
    return checks.every(Boolean);
}

async function enviarCadastro(event) {
    event.preventDefault();
    if (!validarFormularioCadastro()) return;
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    definirMensagemAoVivo(status, traduzir('Criando conta...'));
    try {
        const result = await cadastrarUsuario({
            name: nameField.value.trim(),
            email: emailField.value.trim(),
            phone: obterDigitosTelefone(phoneField.value),
            password: passwordField.value
        });
        definirMensagemAoVivo(status, traduzir('Conta criada com sucesso. Redirecionando...'));
        window.location.href = result?.token || result?.accessToken ? 'perfil.html' : 'login.html';
    } catch (error) {
        definirMensagemAoVivo(status, obterMensagemErroUsuario(error, traduzir('Não conseguimos criar sua conta agora. Revise os dados e tente novamente.')), true);
    } finally {
        submitButton.disabled = false;
    }
}

[nameField, emailField, phoneField, passwordField, confirmField, termsField].forEach((field) => {
    field.addEventListener('input', () => limparErroCampo(field));
    field.addEventListener('change', () => limparErroCampo(field));
});
phoneField.addEventListener('input', () => aplicarMascaraTelefone(phoneField));
form.addEventListener('submit', enviarCadastro);
