export const AUCTION_CATEGORIES = [
    'Jogos Eletrônicos',
    'Cards Colecionáveis',
    'Itens Esportivos',
    'Action Figures',
    'Automóveis',
    'Imóveis',
    'Aparelhos Eletrônicos'
];

export const BRAND_CATEGORIES = new Set(['Automóveis', 'Aparelhos Eletrônicos']);

export function categorySupportsBrand(category) {
    return BRAND_CATEGORIES.has(category);
}
