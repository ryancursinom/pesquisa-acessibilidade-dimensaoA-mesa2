import { categorySupportsBrand } from '../components/catalogConfig.js';
import { clearFieldError, focusFirstInvalid, setFieldError, validatePositiveNumber, validateRequired } from '../components/formValidation.js';
import { getUserErrorMessage } from '../components/userError.js';
import { setLiveMessage } from '../components/statusMessage.js';
import { createAuction, getAuctionById, updateAuction } from '../services/auctionService.js';
import { t } from '../services/i18n.js';

const form = document.getElementById('create-auction-form');
const status = document.getElementById('create-auction-status');
const title = document.getElementById('create-auction-title');
const editId = new URLSearchParams(window.location.search).get('id');
const buyNowField = document.getElementById('auction-buy-now-field');
const customEndField = document.getElementById('auction-custom-end-field');
const brandField = document.getElementById('auction-brand-field');
const preview = document.getElementById('auction-image-preview');
const previewImage = document.getElementById('auction-preview-image');
const removeImageButton = document.getElementById('auction-remove-image');
let existingImageUrl = '';
let imageRemoved = false;
let previewObjectUrl = '';

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
    image: document.getElementById('auction-image')
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
    fields.endDate.required = custom;
    if (!custom) clearFieldError(fields.endDate);
}

function updateBrandField() {
    const visible = categorySupportsBrand(fields.category.value);
    brandField.hidden = !visible;
    if (!visible) fields.brand.value = '';
}

function revokePreviewUrl() {
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = '';
}

function showImagePreview(src, alt = t('Prévia da imagem de capa')) {
    previewImage.src = src;
    previewImage.alt = alt;
    preview.hidden = false;
}

function handleImageSelection() {
    clearFieldError(fields.image);
    const [file] = fields.image.files;
    if (!file) return;
    revokePreviewUrl();
    previewObjectUrl = URL.createObjectURL(file);
    imageRemoved = false;
    showImagePreview(previewObjectUrl, t('Prévia da nova imagem de capa'));
}

function removeSelectedImage() {
    fields.image.value = '';
    imageRemoved = true;
    revokePreviewUrl();
    preview.hidden = true;
    previewImage.removeAttribute('src');
    clearFieldError(fields.image);
}

function validateImage() {
    const hasNewFile = fields.image.files.length === 1;
    const hasExisting = Boolean(existingImageUrl) && !imageRemoved;
    const valid = hasNewFile || hasExisting;
    if (!valid) setFieldError(fields.image, t('Selecione uma imagem de capa para continuar.'));
    else clearFieldError(fields.image);
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
        validateRequired(fields.condition, 'Condição do Item'), validateImage()
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
    const payload = new FormData(form);
    const startingBid = Number(fields.value.value);
    payload.set('saleType', 'AUCTION');
    payload.set('value', String(startingBid));
    payload.set('startingBid', String(startingBid));
    payload.set('endDate', calculateEndDate());
    payload.delete('duration');
    payload.delete('customEndDate');
    if (!isBuyNowEnabled()) payload.delete('buyNowPrice');
    else payload.set('buyNowPrice', String(Number(fields.buyNowValue.value)));
    if (!fields.image.files.length) payload.delete('image');
    if (editId && imageRemoved && !fields.image.files.length) payload.set('removeImage', 'true');
    return payload;
}

async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    const submitButton = form.querySelector('[type="submit"]');
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

function fillImage(auction) {
    existingImageUrl = auction.imageUrl || '';
    imageRemoved = false;
    if (existingImageUrl) showImagePreview(existingImageUrl, auction.imageAlt || t('Imagem atual do leilão'));
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
    fillImage(auction);
    updateSaleTypeFields(); updateDurationFields(); updateBrandField();
    title.textContent = t('Editar Leilão');
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

Object.values(fields).forEach((field) => {
    field.addEventListener('input', () => clearFieldError(field));
    field.addEventListener('change', () => clearFieldError(field));
});
fields.saleType.addEventListener('change', updateSaleTypeFields);
fields.duration.addEventListener('change', updateDurationFields);
fields.category.addEventListener('change', updateBrandField);
fields.image.addEventListener('change', handleImageSelection);
removeImageButton.addEventListener('click', removeSelectedImage);
form.addEventListener('submit', handleSubmit);
window.addEventListener('pagehide', revokePreviewUrl);
updateSaleTypeFields();
updateDurationFields();
updateBrandField();
loadEditData();
