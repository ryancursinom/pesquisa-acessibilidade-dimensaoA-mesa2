const SETTINGS_KEY = 'midas-accessibility-settings';

const DEFAULT_SETTINGS = {
    theme: 'dark',
    contrast: 'normal',
    fontSize: 'medium',
    reduceMotion: false,
    colorVision: 'none',
    language: 'pt-BR'
};

export function getSettings() {
    try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

export function saveSettings(nextSettings) {
    const settings = { ...getSettings(), ...nextSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applySettings(settings);
    window.dispatchEvent(new CustomEvent('midas:settings-updated', { detail: settings }));
    return settings;
}

export function resetSettings() {
    localStorage.removeItem(SETTINGS_KEY);
    applySettings(DEFAULT_SETTINGS);
    window.dispatchEvent(new CustomEvent('midas:settings-updated', { detail: DEFAULT_SETTINGS }));
    return { ...DEFAULT_SETTINGS };
}

export function applySettings(settings = getSettings()) {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.contrast = settings.contrast;
    root.dataset.fontSize = settings.fontSize;
    root.dataset.reduceMotion = String(Boolean(settings.reduceMotion));
    root.dataset.colorVision = settings.colorVision;
    root.lang = settings.language;
}
