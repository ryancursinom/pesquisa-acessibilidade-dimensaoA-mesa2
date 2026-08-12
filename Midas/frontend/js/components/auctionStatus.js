const CLOSED_STATUSES = new Set(['CLOSED', 'FINALIZADO', 'CANCELADO']);
const ACTIVE_STATUSES = new Set(['ACTIVE', 'OPEN', 'ATIVO']);

function normalizeStatus(status) {
    return String(status || '').toUpperCase();
}

export function isAuctionClosed(status) {
    return CLOSED_STATUSES.has(normalizeStatus(status));
}

export function getAuctionStatusClass(status) {
    const normalized = normalizeStatus(status);
    if (CLOSED_STATUSES.has(normalized)) return 'closed';
    if (ACTIVE_STATUSES.has(normalized)) return 'active';
    return 'pending';
}

export function getAuctionStatusLabel(status) {
    const normalized = normalizeStatus(status);
    if (normalized === 'CANCELADO') return 'CANCELADO';
    if (CLOSED_STATUSES.has(normalized)) return 'ENCERRADO';
    if (ACTIVE_STATUSES.has(normalized)) return 'AO VIVO';
    return 'AGUARDANDO';
}
