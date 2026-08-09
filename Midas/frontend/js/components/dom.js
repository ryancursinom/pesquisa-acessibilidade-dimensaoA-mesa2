export function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    const { className, text, attrs = {}, dataset = {} } = options;

    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;

    Object.entries(attrs).forEach(([name, value]) => {
        if (value !== undefined && value !== null) element.setAttribute(name, String(value));
    });
    Object.entries(dataset).forEach(([name, value]) => {
        if (value !== undefined && value !== null) element.dataset[name] = String(value);
    });

    return element;
}

export function clearElement(element) {
    while (element.firstChild) element.removeChild(element.firstChild);
}

export function appendChildren(parent, children) {
    children.filter(Boolean).forEach((child) => parent.appendChild(child));
    return parent;
}

export function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(Number(value || 0));
}

export function formatDateTime(value) {
    if (!value) return 'Data não informada';
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(value));
}
