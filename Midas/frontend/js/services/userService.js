import { enviarRequisicaoApi } from './api.js';

export function obterPerfil() {
    return enviarRequisicaoApi('/users/me');
}

export function atualizarPerfil(data) {
    return enviarRequisicaoApi('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export function atualizarSenha(data) {
    return enviarRequisicaoApi('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}


export function atualizarFotoPerfil(file) {
    const formData = new FormData();
    formData.append('image', file);

    return enviarRequisicaoApi('/users/me/photo', {
        method: 'PUT',
        body: formData
    });
}
