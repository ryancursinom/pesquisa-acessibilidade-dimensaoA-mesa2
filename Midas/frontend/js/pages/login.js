import { limparErroCampo, focarPrimeiroCampoInvalido, validarEmail, validarCampoObrigatorio } from '../components/formValidation.js';
import { definirMensagemAoVivo } from '../components/statusMessage.js';
import { obterMensagemErroUsuario } from '../components/userError.js';
import { autenticarUsuario } from '../services/authService.js';
import { traduzir } from '../services/i18n.js';

const form = document.getElementById('login-form');
const email = document.getElementById('login-email');
const password = document.getElementById('login-password');
const status = document.getElementById('login-status');

function obterDestinoRedirecionamento() {
    const redirect = new URLSearchParams(window.location.search).get('redirect');
    if (!redirect) return 'perfil.html';

    const allowedPages = new Set(['perfil.html', 'meus-leiloes.html', 'criar-leilao.html']);
    try {
        const target = new URL(redirect, window.location.href);
        const page = target.pathname.split('/').pop();
        const currentDirectory = window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/') + 1);
        const targetDirectory = target.pathname.slice(0, target.pathname.lastIndexOf('/') + 1);
        if (target.origin !== window.location.origin || targetDirectory !== currentDirectory || !allowedPages.has(page)) {
            return 'perfil.html';
        }
        return `${page}${target.search}${target.hash}`;
    } catch {
        return 'perfil.html';
    }
}

function validarFormularioLogin() {
    const emailValid = validarCampoObrigatorio(email, traduzir('E-mail')) && validarEmail(email);
    const passwordValid = validarCampoObrigatorio(password, traduzir('Senha'));
    if (!emailValid || !passwordValid) focarPrimeiroCampoInvalido(form);
    return emailValid && passwordValid;
}

async function entrarNaConta(event) {
    event.preventDefault();
    if (!validarFormularioLogin()) return;
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    definirMensagemAoVivo(status, traduzir('Entrando...'));
    try {
        await autenticarUsuario({ email: email.value.trim(), password: password.value });
        definirMensagemAoVivo(status, traduzir('Login realizado. Redirecionando...'));
        window.location.href = obterDestinoRedirecionamento();
    } catch (error) {
        definirMensagemAoVivo(status, obterMensagemErroUsuario(error, traduzir('Não conseguimos entrar na sua conta agora. Confira seus dados e tente novamente.')), true);
    } finally {
        submitButton.disabled = false;
    }
}

email.addEventListener('input', () => limparErroCampo(email));
password.addEventListener('input', () => limparErroCampo(password));
form.addEventListener('submit', entrarNaConta);
