import { sincronizarCampoMarca } from '../components/catalogConfig.js';
import { limparElemento, criarElemento } from '../components/dom.js';
import { criarIcone } from '../components/icons.js';
import { limparErroCampo, focarPrimeiroCampoInvalido, definirErroCampo, validarNumeroPositivo, validarCampoObrigatorio } from '../components/formValidation.js';
import { obterMensagemErroUsuario } from '../components/userError.js';
import { exigirAutenticacao } from '../components/privatePageGuard.js';
import { definirMensagemAoVivo } from '../components/statusMessage.js';
import { criarLeilao, obterLeilaoPorId, atualizarLeilao } from '../services/auctionService.js';
import { traduzir } from '../services/i18n.js';

const form = document.getElementById('create-auction-form');
const status = document.getElementById('create-auction-status');
const title = document.getElementById('create-auction-title');
const submitButton = document.getElementById('auction-submit-button');
const editId = new URLSearchParams(window.location.search).get('id');
const canInitializePage = exigirAutenticacao();
const buyNowField = document.getElementById('auction-buy-now-field');
const customEndField = document.getElementById('auction-custom-end-field');
const brandField = document.getElementById('auction-brand-field');
const imagePreview = document.getElementById('auction-images-preview');

let existingImageUrls = [];
let selectedImages = [];

const fields = {
    name: document.getElementById('auction-name'),
    category: document.getElementById('auction-category'),
    description: document.getElementById('auction-description'),
    saleType: document.getElementById('auction-sale-type'),
    value: document.getElementById('auction-value'),
    buyNowValue: document.getElementById('auction-buy-now-value'),
    duration: document.getElementById('auction-duration'),
    endDate: document.getElementById('auction-end-date'),
    condition: document.getElementById('auction-condition'),
    brand: document.getElementById('auction-brand'),
    images: document.getElementById('auction-images')
};

function verificarCompraImediataAtivada() {
    return fields.saleType.value === 'AUCTION_WITH_BUY_NOW';
}

function atualizarCamposTipoVenda() {
    buyNowField.hidden = !verificarCompraImediataAtivada();
    if (!verificarCompraImediataAtivada()) {
        fields.buyNowValue.value = '';
        limparErroCampo(fields.buyNowValue);
    }
}

function atualizarCamposDuracao() {
    const custom = fields.duration.value === 'custom';
    customEndField.hidden = !custom;
    fields.endDate.disabled = !custom;
    fields.endDate.required = custom;
    if (!custom) limparErroCampo(fields.endDate);
}

function atualizarCampoMarca() {
    sincronizarCampoMarca(fields.category.value, brandField, fields.brand);
}

function revogarUrlImagemSelecionada(image) {
    if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
}

function removerImagemExistente(index) {
    existingImageUrls.splice(index, 1);
    renderizarPreviasImagens();
}

function removerImagemSelecionada(index) {
    revogarUrlImagemSelecionada(selectedImages[index]);
    selectedImages.splice(index, 1);
    renderizarPreviasImagens();
}

function criarCardPrevia(src, label, onRemove, number) {
    const card = criarElemento('figure', { className: 'image-preview-card' });
    const image = criarElemento('img', { attrs: { src, alt: label } });
    const button = criarElemento('button', {
        className: 'btn-danger image-preview-remove',
        text: traduzir('Remover'),
        attrs: { type: 'button', 'aria-label': traduzir('Remover imagem {number}', { number }) }
    });
    button.prepend(criarIcone('trash'));
    button.addEventListener('click', onRemove);
    card.append(image, button);
    return card;
}

function renderizarPreviasImagens() {
    limparElemento(imagePreview);
    let number = 1;

    existingImageUrls.forEach((url, index) => {
        imagePreview.appendChild(criarCardPrevia(
            url, traduzir('Imagem atual {number} do leilão', { number }),
            () => removerImagemExistente(index), number++
        ));
    });

    selectedImages.forEach((image, index) => {
        imagePreview.appendChild(criarCardPrevia(
            image.previewUrl, traduzir('Prévia da nova imagem {number}', { number }),
            () => removerImagemSelecionada(index), number++
        ));
    });

    imagePreview.hidden = number === 1;
}

function adicionarImagensSelecionadas(files) {
    const knownFiles = new Set(selectedImages.map(({ file }) => `${file.name}-${file.size}-${file.lastModified}`));
    [...files].forEach((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (!file.type.startsWith('image/') || knownFiles.has(key)) return;
        selectedImages.push({ file, previewUrl: URL.createObjectURL(file) });
        knownFiles.add(key);
    });
}

function atualizarSelecaoImagens() {
    limparErroCampo(fields.images);
    adicionarImagensSelecionadas(fields.images.files);
    fields.images.value = '';
    renderizarPreviasImagens();
}

function validarImagens() {
    const valid = existingImageUrls.length + selectedImages.length > 0;
    if (!valid) definirErroCampo(fields.images, traduzir('Selecione pelo menos uma imagem do item para continuar.'));
    else limparErroCampo(fields.images);
    return valid;
}

function validarCompraImediata() {
    if (!verificarCompraImediataAtivada()) return true;
    const startingBid = Number(fields.value.value);
    const buyNowPrice = Number(fields.buyNowValue.value);
    const valid = Number.isFinite(buyNowPrice) && buyNowPrice > startingBid;
    if (!valid) definirErroCampo(fields.buyNowValue, traduzir('O valor de Compra Imediata deve ser maior que o valor inicial.'));
    else limparErroCampo(fields.buyNowValue);
    return valid;
}

function validarDataEncerramento() {
    if (fields.duration.value !== 'custom') return true;
    const time = new Date(fields.endDate.value).getTime();
    const valid = Boolean(fields.endDate.value) && time > Date.now();
    if (!valid) definirErroCampo(fields.endDate, traduzir('Escolha uma data e hora futuras para o encerramento.'));
    else limparErroCampo(fields.endDate);
    return valid;
}

function validarFormularioLeilao() {
    const checks = [
        validarCampoObrigatorio(fields.name, 'Nome do item'),
        validarCampoObrigatorio(fields.category, 'Categoria'),
        validarCampoObrigatorio(fields.description, 'Descrição'),
        validarNumeroPositivo(fields.value, 'Valor inicial', 0),
        validarCompraImediata(), validarDataEncerramento(),
        validarCampoObrigatorio(fields.condition, 'Condição do Item'), validarImagens()
    ];
    if (checks.includes(false)) focarPrimeiroCampoInvalido(form);
    return checks.every(Boolean);
}

function calcularDataEncerramento() {
    if (fields.duration.value === 'custom') return new Date(fields.endDate.value).toISOString();
    const hours = Number(fields.duration.value);
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function montarDadosLeilao() {
    // Na edição, enviamos as URLs antigas separadas dos novos arquivos para o backend saber o que manter.
    const payload = new FormData(form);
    const startingBid = Number(fields.value.value);
    payload.delete('saleType');
    payload.delete('images');
    payload.set('value', String(startingBid));
    payload.set('startingBid', String(startingBid));
    payload.set('endDate', calcularDataEncerramento());
    payload.delete('duration');
    payload.delete('customEndDate');
    if (!verificarCompraImediataAtivada()) payload.delete('buyNowPrice');
    else payload.set('buyNowPrice', String(Number(fields.buyNowValue.value)));
    if (editId) payload.set('existingImageUrls', JSON.stringify(existingImageUrls));
    selectedImages.forEach(({ file }) => payload.append('images', file));
    return payload;
}

async function salvarLeilao(event) {
    event.preventDefault();
    if (!validarFormularioLeilao()) return;
    submitButton.disabled = true;
    definirMensagemAoVivo(status, traduzir(editId ? 'Salvando alterações...' : 'Publicando item...'));
    try {
        if (editId) await atualizarLeilao(editId, montarDadosLeilao());
        else await criarLeilao(montarDadosLeilao());
        definirMensagemAoVivo(status, traduzir(editId ? 'Leilão atualizado com sucesso.' : 'Item publicado com sucesso.'));
        window.setTimeout(() => { window.location.href = 'meus-leiloes.html?aba=criados'; }, 700);
    } catch (error) {
        definirMensagemAoVivo(status, obterMensagemErroUsuario(error, traduzir('Não conseguimos salvar este leilão agora. Revise os dados e tente novamente.')), true);
    } finally {
        submitButton.disabled = false;
    }
}

function converterParaDataHoraLocal(value) {
    if (!value) return '';
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function preencherImagens(auction) {
    const urls = Array.isArray(auction.imageUrls) ? auction.imageUrls : [];
    existingImageUrls = urls.length ? urls.filter(Boolean) : [auction.imageUrl].filter(Boolean);
    renderizarPreviasImagens();
}

function preencherFormularioEdicao(auction) {
    form.elements.name.value = auction.title || '';
    form.elements.category.value = auction.category || '';
    form.elements.description.value = auction.description || '';
    form.elements.value.value = auction.startingBid ?? auction.currentBid ?? '';
    form.elements.condition.value = auction.condition || '';
    form.elements.brand.value = auction.brand || '';
    fields.saleType.value = auction.buyNowPrice ? 'AUCTION_WITH_BUY_NOW' : 'AUCTION';
    fields.buyNowValue.value = auction.buyNowPrice || '';
    fields.duration.value = 'custom';
    fields.endDate.value = converterParaDataHoraLocal(auction.endsAt);
    preencherImagens(auction);
    atualizarCamposTipoVenda();
    atualizarCamposDuracao();
    atualizarCampoMarca();
    title.textContent = traduzir('Editar Leilão');
    submitButton.textContent = traduzir('Salvar alterações');
}

async function carregarDadosEdicao() {
    if (!editId) return;
    definirMensagemAoVivo(status, traduzir('Carregando dados do leilão...'));
    try {
        preencherFormularioEdicao(await obterLeilaoPorId(editId));
        definirMensagemAoVivo(status, '');
    } catch (error) {
        definirMensagemAoVivo(status, obterMensagemErroUsuario(error, traduzir('Não conseguimos carregar os dados deste leilão. Tente novamente em instantes.')), true);
    }
}

function liberarPreviasImagens() {
    selectedImages.forEach(revogarUrlImagemSelecionada);
    selectedImages = [];
}

if (canInitializePage) {
    Object.values(fields).forEach((field) => {
        field.addEventListener('input', () => limparErroCampo(field));
        field.addEventListener('change', () => limparErroCampo(field));
    });
    fields.saleType.addEventListener('change', atualizarCamposTipoVenda);
    fields.duration.addEventListener('change', atualizarCamposDuracao);
    fields.category.addEventListener('change', atualizarCampoMarca);
    fields.images.addEventListener('change', atualizarSelecaoImagens);
    form.addEventListener('submit', salvarLeilao);
    window.addEventListener('pagehide', liberarPreviasImagens);
    atualizarCamposTipoVenda();
    atualizarCamposDuracao();
    atualizarCampoMarca();
    carregarDadosEdicao();
}
