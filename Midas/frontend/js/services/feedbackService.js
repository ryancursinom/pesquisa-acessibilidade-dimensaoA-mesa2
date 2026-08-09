import { apiRequest } from './api.js';

export function submitFeedback(payload) {
    return apiRequest('/feedback', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export function getFeedbackHighlights() {
    return apiRequest('/feedback/highlights');
}
