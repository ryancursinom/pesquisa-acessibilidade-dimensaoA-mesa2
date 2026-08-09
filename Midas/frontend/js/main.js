import { initAccessibilityPanel } from './components/accessibilityPanel.js';
import { initFeedbackModal } from './components/feedbackModal.js';
import { initSiteChrome } from './components/siteChrome.js';
import { applySettings } from './services/settingsService.js';

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function getInternalTarget(link) {
    const href = link.getAttribute('href');
    if (!href || href === '#' || !href.startsWith('#')) return null;
    return document.querySelector(href);
}

function focusSection(target) {
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
}

function handleInternalNavigation(event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = getInternalTarget(link);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotionQuery.matches ? 'auto' : 'smooth', block: 'start' });
    focusSection(target);
}

function initGlobalNavigation() {
    document.addEventListener('click', handleInternalNavigation);
}

function initGlobalFeatures() {
    applySettings();
    initSiteChrome();
    initAccessibilityPanel();
    initFeedbackModal();
    initGlobalNavigation();
}

initGlobalFeatures();
