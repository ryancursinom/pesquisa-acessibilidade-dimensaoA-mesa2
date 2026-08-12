import { syncBrandField } from '../components/catalogConfig.js';
import { clearElement, createElement } from '../components/dom.js';
import { createIcon } from '../components/icons.js';
import { clearFieldError, focusFirstInvalid, setFieldError, validatePositiveNumber, validateRequired } from '../components/formValidation.js';
import { getUserErrorMessage } from '../components/userError.js';
import { setLiveMessage } from '../components/statusMessage.js';
import { createAuction, getAuctionById, updateAuction } from '../services/auctionService.js';
import { t } from '../services/i18n.js';

const form = document.getElementById('create-auction-form');
const status = document.getElementById('create-auction-status');
const title = document.getElementById('create-auction-title');
const submitButton = document.getElementById('auction-submit-button');
const editId = new URLSearchParams(window.location.search).get('id');
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

function isBuyNowEnabled() {
    return fields.saleType.value === 'AUCTION_WITH_BUY_NOW';
}

function updateSaleTypeFields() {
    buyNowField.hidden = !isBuyNowEnabled();
    if (!isBuyNowEnabled()) {
        fields.buyNowValue.value = '';
        clearFieldError(fields.buyNowValue);
    }
}

function updateDurationFields() {
    const custom = fields.duration.value === 'custom';
    customEndField.hidden = !custom;
    fields.endDate.disabled = !custom;
    fields.endDate.required = custom;
    if (!custom) clearFieldError(fields.endDate);
}

function updateBrandField() {
    syncBrandField(fields.category.value, brandField, fields.brand);
}

function revokeSelectedImage(image) {
    if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
}

function removeExistingImage(index) {
    existingImageUrls.splice(index, 1);
    renderImagePreviews();
}

function removeSelectedImage(index) {
    revokeSelectedImage(selectedImages[index]);
    selectedImages.splice(index, 1);
    renderImagePreviews();
}

function createPreviewCard(src, label, onRemove, number) {
    const card = createElement('figure', { className: 'image-preview-card' });
    const image = createElement('img', { attrs: { src, alt: label } });
    const button = createElement('button', {
        className: 'btn-danger image-preview-remove',
        text: t('Remover'),
        attrs: { type: 'button', 'aria-label': t('Remover imagem {number}', { number }) }
    });
    button.prepend(createIcon('trash'));
    button.addEventListener('click', onRemove);
    card.append(image, button);
    return card;
}

function renderImagePreviews() {
    clearElement(imagePreview);
    let number = 1;

    existingImageUrls.forEach((url, index) => {
        imagePreview.appendChild(createPreviewCard(
            url, t('Imagem atual {number} do leilão', { number }),
            () => removeExistingImage(index), number++
        ));
    });

    selectedImages.forEach((image, index) => {
        imagePreview.appendChild(createPreviewCard(
            image.previewUrl, t('Prévia da nova imagem {number}', { number }),
            () => removeSelectedImage(index), number++
        ));
    });

    imagePreview.hidden = number === 1;
}

function addSelectedImages(files) {
    const knownFiles = new Set(selectedImages.map(({ file }) => `${file.name}-${file.size}-${file.lastModified}`));
    [...files].forEach((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (!file.type.startsWith('image/') || knownFiles.has(key)) return;
        selectedImages.push({ file, previewUrl: URL.createObjectURL(file) });
        knownFiles.add(key);
    });
}

function handleImageSelection() {
    clearFieldError(fields.images);
    addSelectedImages(fields.images.files);
    fields.images.value = '';
    renderImagePreviews();
}

function validateImages() {
    const valid = existingImageUrls.length + selectedImages.length > 0;
    if (!valid) setFieldError(fields.images, t('Selecione pelo menos uma imagem do item para continuar.'));
    else clearFieldError(fields.images);
    return valid;
}

function validateBuyNow() {
    if (!isBuyNowEnabled()) return true;
    const startingBid = Number(fields.value.value);
    const buyNowPrice = Number(fields.buyNowValue.value);
    const valid = Number.isFinite(buyNowPrice) && buyNowPrice > startingBid;
    if (!valid) setFieldError(fields.buyNowValue, t('O valor de Compra Imediata deve ser maior que o valor inicial.'));
    else clearFieldError(fields.buyNowValue);
    return valid;
}

function validateEndDate() {
    if (fields.duration.value !== 'custom') return true;
    const time = new Date(fields.endDate.value).getTime();
    const valid = Boolean(fields.endDate.value) && time > Date.now();
    if (!valid) setFieldError(fields.endDate, t('Escolha uma data e hora futuras para o encerramento.'));
    else clearFieldError(fields.endDate);
    return valid;
}

function validateForm() {
    const checks = [
        validateRequired(fields.name, 'Nome do item'),
        validateRequired(fields.category, 'Categoria'),
        validateRequired(fields.description, 'Descrição'),
        validatePositiveNumber(fields.value, 'Valor inicial', 0),
        validateBuyNow(), validateEndDate(),
        validateRequired(fields.condition, 'Condição do Item'), validateImages()
    ];
    if (checks.includes(false)) focusFirstInvalid(form);
    return checks.every(Boolean);
}

function calculateEndDate() {
    if (fields.duration.value === 'custom') return new Date(fields.endDate.value).toISOString();
    const hours = Number(fields.duration.value);
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function buildPayload() {
    // Na edição, enviamos as URLs antigas separadas dos novos arquivos para o backend saber o que manter.
    const payload = new FormData(form);
    const startingBid = Number(fields.value.value);
    payload.delete('saleType');
    payload.delete('images');
    payload.set('value', String(startingBid));
    payload.set('startingBid', String(startingBid));
    payload.set('endDate', calculateEndDate());
    payload.delete('duration');
    payload.delete('customEndDate');
    if (!isBuyNowEnabled()) payload.delete('buyNowPrice');
    else payload.set('buyNowPrice', String(Number(fields.buyNowValue.value)));
    if (editId) payload.set('existingImageUrls', JSON.stringify(existingImageUrls));
    selectedImages.forEach(({ file }) => payload.append('images', file));
    return payload;
}

async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    submitButton.disabled = true;
    setLiveMessage(status, t(editId ? 'Salvando alterações...' : 'Publicando item...'));
    try {
        if (editId) await updateAuction(editId, buildPayload());
        else await createAuction(buildPayload());
        setLiveMessage(status, t(editId ? 'Leilão atualizado com sucesso.' : 'Item publicado com sucesso.'));
        window.setTimeout(() => { window.location.href = 'meus-leiloes.html?aba=criados'; }, 700);
    } catch (error) {
        setLiveMessage(status, getUserErrorMessage(error, t('Não conseguimos salvar este leilão agora. Revise os dados e tente novamente.')), true);
    } finally {
        submitButton.disabled = false;
    }
}

function toLocalDateTime(value) {
    if (!value) return '';
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fillImages(auction) {
    const urls = Array.isArray(auction.imageUrls) ? auction.imageUrls : [];
    existingImageUrls = urls.length ? urls.filter(Boolean) : [auction.imageUrl].filter(Boolean);
    renderImagePreviews();
}

function fillEditForm(auction) {
    form.elements.name.value = auction.title || '';
    form.elements.category.value = auction.category || '';
    form.elements.description.value = auction.description || '';
    form.elements.value.value = auction.startingBid ?? auction.currentBid ?? '';
    form.elements.condition.value = auction.condition || '';
    form.elements.brand.value = auction.brand || '';
    fields.saleType.value = auction.buyNowPrice ? 'AUCTION_WITH_BUY_NOW' : 'AUCTION';
    fields.buyNowValue.value = auction.buyNowPrice || '';
    fields.duration.value = 'custom';
    fields.endDate.value = toLocalDateTime(auction.endsAt);
    fillImages(auction);
    updateSaleTypeFields();
    updateDurationFields();
    updateBrandField();
    title.textContent = t('Editar Leilão');
    submitButton.textContent = t('Salvar alterações');
}

async function loadEditData() {
    if (!editId) return;
    setLiveMessage(status, t('Carregando dados do leilão...'));
    try {
        fillEditForm(await getAuctionById(editId));
        setLiveMessage(status, '');
    } catch (error) {
        setLiveMessage(status, getUserErrorMessage(error, t('Não conseguimos carregar os dados deste leilão. Tente novamente em instantes.')), true);
    }
}

function releaseImagePreviews() {
    selectedImages.forEach(revokeSelectedImage);
    selectedImages = [];
}

Object.values(fields).forEach((field) => {
    field.addEventListener('input', () => clearFieldError(field));
    field.addEventListener('change', () => clearFieldError(field));
});
fields.saleType.addEventListener('change', updateSaleTypeFields);
fields.duration.addEventListener('change', updateDurationFields);
fields.category.addEventListener('change', updateBrandField);
fields.images.addEventListener('change', handleImageSelection);
form.addEventListener('submit', handleSubmit);
window.addEventListener('pagehide', releaseImagePreviews);
updateSaleTypeFields();
updateDurationFields();
updateBrandField();
loadEditData();
