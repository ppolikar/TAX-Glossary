let searchTimeout = null;

/**
 * Пошук по всіх полях терміну
 */
function searchTerms(terms, query) {
    if (!query || query.trim() === '') {
        return terms;
    }

    const searchLower = query.toLowerCase().trim();
    
    return terms.filter(term => {
        // Пошук по всіх полях
        const searchableFields = [
            term.Acronym || '',
            term.Term || '',
            term.Definition || '',
            term.Notes || '',
            term['Абревіатура'] || '',
            term['Термін'] || '',
            term['Визначення'] || '',
            term['Примітки'] || ''
        ];

        return searchableFields.some(field => 
            field.toLowerCase().includes(searchLower)
        );
    });
}

/**
 * Сортування термінів (алфавітне за Term EN)
 */
function sortTerms(terms) {
    return [...terms].sort((a, b) => {
        const termA = (a.Term || '').toLowerCase();
        const termB = (b.Term || '').toLowerCase();
        return termA.localeCompare(termB, 'uk');
    });
}

/**
 * Debounced пошук
 */
function debounceSearch(callback, delay) {
    return function(...args) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            callback.apply(this, args);
        }, delay);
    };
}


