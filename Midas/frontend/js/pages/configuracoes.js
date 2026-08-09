import { setLiveMessage } from '../components/statusMessage.js';
import { getSettings, resetSettings, saveSettings } from '../services/settingsService.js';

const form = document.getElementById('settings-form');
const status = document.getElementById('settings-status');

function populateForm(settings) {
    form.elements.theme.value = settings.theme;
    form.elements.contrast.value = settings.contrast;
    form.elements.fontSize.value = settings.fontSize;
    form.elements.colorVision.value = settings.colorVision;
    form.elements.language.value = settings.language;
    form.elements.reduceMotion.checked = settings.reduceMotion;
}

function readForm() {
    return {
        theme: form.elements.theme.value,
        contrast: form.elements.contrast.value,
        fontSize: form.elements.fontSize.value,
        colorVision: form.elements.colorVision.value,
        language: form.elements.language.value,
        reduceMotion: form.elements.reduceMotion.checked
    };
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    saveSettings(readForm());
    setLiveMessage(status, 'Configurações salvas.');
});

document.getElementById('reset-settings').addEventListener('click', () => {
    const settings = resetSettings();
    populateForm(settings);
    setLiveMessage(status, 'Configurações restauradas para o padrão.');
});

populateForm(getSettings());
