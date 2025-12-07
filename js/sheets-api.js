// Кеш для даних
let termsCache = null;
let cacheTimestamp = null;

/**
 * Отримати дані з Google Sheets
 */
async function fetchTermsFromSheet() {
    // Перевірка кешу
    if (termsCache && cacheTimestamp) {
        const now = Date.now();
        if (now - cacheTimestamp < CONFIG.CACHE_DURATION) {
            return termsCache;
        }
    }

    try {
        // URL має бути правильно закодований
        // Використовуємо формат: 'SheetName'!A:Z або просто SheetName
        const sheetName = CONFIG.TERMS_SHEET.trim();
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${CONFIG.API_KEY}`;
        
        console.log('Запит до API:', url.replace(CONFIG.API_KEY, 'API_KEY_HIDDEN'));
        
        const response = await fetch(url);
        
        if (!response.ok) {
            // Якщо помилка 400 з "Unable to parse range", спробуємо отримати список листів
            if (response.status === 400) {
                try {
                    const errorData = await response.json();
                    if (errorData.error && errorData.error.message && errorData.error.message.includes('parse range')) {
                        // Спробуємо отримати список доступних листів
                        const availableSheets = await getSheetNames();
                        throw new Error(`Лист "${CONFIG.TERMS_SHEET}" не знайдено. Доступні листи: ${availableSheets.join(', ')}. Перевірте назву в config.js`);
                    }
                    throw new Error(`HTTP error! status: ${response.status} - ${errorData.error.message || JSON.stringify(errorData.error)}`);
                } catch (e) {
                    if (e.message.includes('Доступні листи')) {
                        throw e; // Передаємо помилку зі списком листів далі
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            
            // Для інших помилок
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    errorMessage += ` - ${errorData.error.message || JSON.stringify(errorData.error)}`;
                }
            } catch (e) {
                // Якщо не вдалося розпарсити помилку, використовуємо стандартне повідомлення
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        if (!data.values || data.values.length === 0) {
            throw new Error('Таблиця порожня або не знайдена');
        }

        // Парсинг даних
        const headers = data.values[0];
        const rows = data.values.slice(1);
        
        const terms = rows.map((row, index) => {
            const term = {};
            headers.forEach((header, colIndex) => {
                term[header] = row[colIndex] || '';
            });
            term._id = index + 1; // Простий ID
            return term;
        });

        // Фільтрація Draft термінів
        const activeTerms = terms.filter(term => 
            term.Status && term.Status.toLowerCase() !== 'draft'
        );

        // Збереження в кеш
        termsCache = activeTerms;
        cacheTimestamp = Date.now();
        
        // Збереження в localStorage для офлайн режиму
        try {
            localStorage.setItem('termsCache', JSON.stringify(activeTerms));
            localStorage.setItem('cacheTimestamp', cacheTimestamp.toString());
        } catch (e) {
            console.warn('Не вдалося зберегти в localStorage:', e);
        }

        return activeTerms;
    } catch (error) {
        console.error('Помилка завантаження даних:', error);
        
        // Спробувати завантажити з localStorage
        try {
            const cached = localStorage.getItem('termsCache');
            const cachedTime = localStorage.getItem('cacheTimestamp');
            
            if (cached && cachedTime) {
                const age = Date.now() - parseInt(cachedTime);
                if (age < CONFIG.CACHE_DURATION * 24) { // До 24 годин
                    console.log('Використовую кешовані дані');
                    return JSON.parse(cached);
                }
            }
        } catch (e) {
            console.warn('Помилка читання з localStorage:', e);
        }
        
        throw error;
    }
}

/**
 * Отримати конкретний термін за ID
 */
async function getTermById(id) {
    const terms = await fetchTermsFromSheet();
    return terms.find(term => term._id === parseInt(id));
}

/**
 * Отримати список всіх листів у таблиці (для діагностики)
 */
async function getSheetNames() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}?key=${CONFIG.API_KEY}&fields=sheets.properties.title`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.sheets.map(sheet => sheet.properties.title);
    } catch (error) {
        console.error('Помилка отримання списку листів:', error);
        throw error;
    }
}

/**
 * Очистити кеш (для примусового оновлення)
 */
function clearCache() {
    termsCache = null;
    cacheTimestamp = null;
    localStorage.removeItem('termsCache');
    localStorage.removeItem('cacheTimestamp');
}

