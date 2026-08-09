import { apiRequest } from './api.js';

export function getProfile() {
    return apiRequest('/users/me');
}

export function updateProfile(data) {
    return apiRequest('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

export function updatePassword(data) {
    return apiRequest('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}
