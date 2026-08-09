import { clearFieldError, focusFirstInvalid, setFieldError, validatePositiveNumber, validateRequired } from '../components/formValidation.js';
import { setLiveMessage } from '../components/statusMessage.js';
import { createAuction, getAuctionById, updateAuction } from '../services/auctionService.js';

const form = document.getElementById('create-auction-form');
const status = document.getElementById('create-auction-status');
const title = document.getElementById('create-auction-title');
const editId = new URLSearchParams(window.location.search).get('id');

const fields = {
    name: document.getElementById('auction-name'),
    category: document.getElementById('auction-category'),
    description: document.getElementById('auction-description'),
    value: document.getElementById('auction-value'),
    endDate: document.getElementById('auction-end-date'),
    condition: document.getElementById('auction-condition'),
    images: document.getElementById('auction-images')
};

function validateImages() {
    if (editId && fields.images.files.length === 0) {
        clearFieldError(fields.images);
        return true;
    }
    const valid = fields.images.files.length > 0;
    if (!valid) setFieldError(fields.images, 'Selecione pelo menos uma imagem.');
    else clearFieldError(fields.images);
    return valid;
}

function validateEndDate() {
    const value = fields.endDate.value;
    const valid = Boolean(value) && new Date(value).getTime() > Date.now();
    if (!valid) setFieldError(fields.endDate, 'Informe uma data futura para o encerramento.');
    else clearFieldError(fields.endDate);
    return valid;
}

function validateForm() {
    const checks = [
        validateRequired(fields.name, 'Nome do item'),
        validateRequired(fields.category, 'Categoria'),
        validateRequired(fields.description, 'Descrição'),
        validatePositiveNumber(fields.value, 'Valor', 0),
        validateEndDate(),
        validateRequired(fields.condition, 'Estado do item'),
        validateImages()
    ];
    if (checks.includes(false)) focusFirstInvalid(form);
    return checks.every(Boolean);
}

function buildPayload() {
    const payload = new FormData(form);
    payload.set('value', String(Number(fields.value.value)));
    if (editId && fields.images.files.length === 0) payload.delete('images');
    return payload;
}

async function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    setLiveMessage(status, editId ? 'Salvando alterações...' : 'Publicando item...');
    try {
        if (editId) await updateAuction(editId, buildPayload());
        else await createAuction(buildPayload());
        setLiveMessage(status, editId ? 'Leilão atualizado com sucesso.' : 'Item publicado com sucesso.');
        window.setTimeout(() => { window.location.href = 'meus-leiloes.html?aba=criados'; }, 700);
    } catch (error) {
        setLiveMessage(status, error.message, true);
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

function fillEditForm(auction) {
    form.elements.name.value = auction.title || '';
    form.elements.category.value = auction.category || '';
    form.elements.description.value = auction.description || '';
    form.elements.saleType.value = auction.saleType || 'AUCTION';
    form.elements.value.value = auction.saleType === 'BUY_NOW' ? auction.price : auction.startingBid;
    form.elements.endDate.value = toLocalDateTime(auction.endsAt);
    form.elements.condition.value = auction.condition || '';
    form.elements.brand.value = auction.brand || '';
    form.elements.rarity.value = auction.rarity || '';
    title.textContent = 'Editar Leilão';
}

async function loadEditData() {
    if (!editId) return;
    setLiveMessage(status, 'Carregando dados do leilão...');
    try {
        fillEditForm(await getAuctionById(editId));
        setLiveMessage(status, '');
    } catch (error) {
        setLiveMessage(status, error.message, true);
    }
}

Object.values(fields).forEach((field) => {
    field.addEventListener('input', () => clearFieldError(field));
    field.addEventListener('change', () => clearFieldError(field));
});
form.addEventListener('submit', handleSubmit);
loadEditData();
