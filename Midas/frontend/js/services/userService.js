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


export function updateProfilePhoto(file) {
    const formData = new FormData();
    formData.append('image', file);

    return apiRequest('/users/me/photo', {
        method: 'PUT',
        body: formData
    });
}
