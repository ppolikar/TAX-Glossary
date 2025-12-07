let allTerms = [];
let filteredTerms = [];

// Ініціалізація
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadTerms();
        setupSearch();
        setupModal();
    } catch (error) {
        showError('Помилка завантаження даних. Перевірте налаштування API.');
        console.error(error);
    }
});

/**
 * Завантаження термінів
 */
async function loadTerms() {
    const listContainer = document.getElementById('termsList');
    if (!listContainer) return; // Якщо це не головна сторінка

    listContainer.innerHTML = '<div class="loading">Завантаження...</div>';

    try {
        allTerms = await fetchTermsFromSheet();
        allTerms = sortTerms(allTerms);
        filteredTerms = allTerms;
        
        renderTerms(filteredTerms);
        updateStats(filteredTerms.length);
    } catch (error) {
        let errorDetails = error.message;
        
        // Додаткові підказки для типових помилок
        if (error.message.includes('400')) {
            errorDetails += '<br><br><strong>Можливі причини:</strong><br>';
            errorDetails += '• Неправильна назва листа (перевірте TERMS_SHEET в config.js)<br>';
            errorDetails += '• Таблиця не має публічного доступу<br>';
            errorDetails += '• API ключ не обмежений до Google Sheets API<br>';
            errorDetails += '• Google Sheets API не увімкнено в проекті';
        } else if (error.message.includes('403')) {
            errorDetails += '<br><br><strong>Можливі причини:</strong><br>';
            errorDetails += '• API ключ не має доступу до таблиці<br>';
            errorDetails += '• Таблиця приватна (зробіть її публічною або надайте доступ)';
        } else if (error.message.includes('404')) {
            errorDetails += '<br><br><strong>Можливі причини:</strong><br>';
            errorDetails += '• Неправильний Sheet ID<br>';
            errorDetails += '• Лист з такою назвою не існує';
            errorDetails += '<br><button onclick="checkSheetNames()" class="btn-suggest" style="margin-top: 0.5rem;">Перевірити назви листів</button>';
        } else if (error.message.includes('Доступні листи')) {
            errorDetails += '<br><br><strong>Що робити:</strong><br>';
            errorDetails += '1. Відкрийте файл js/config.js<br>';
            errorDetails += '2. Знайдіть рядок: TERMS_SHEET: \'Terms\'<br>';
            errorDetails += '3. Змініть назву на одну з доступних листів (дивіться вище)<br>';
            errorDetails += '4. Перезавантажте сторінку';
            errorDetails += '<br><br><button onclick="checkSheetNames()" class="btn-suggest" style="margin-top: 0.5rem;">Показати список листів</button>';
        }
        
        listContainer.innerHTML = `
            <div class="error">
                Помилка завантаження: ${errorDetails}
                <br><br>
                <button onclick="location.reload()" class="btn-suggest">Спробувати ще раз</button>
                <br><br>
                <details style="text-align: left; margin-top: 1rem;">
                    <summary style="cursor: pointer; color: var(--primary-color);">Детальна інформація для розробника</summary>
                    <pre style="background: #f5f5f5; padding: 1rem; margin-top: 0.5rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem;">${escapeHtml(JSON.stringify({message: error.message, stack: error.stack}, null, 2))}</pre>
                </details>
            </div>
        `;
    }
}

/**
 * Відображення списку термінів
 */
function renderTerms(terms) {
    const listContainer = document.getElementById('termsList');
    
    if (!terms || terms.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p>Терміни не знайдено</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = terms.map(term => createTermCard(term)).join('');
    
    // Додати обробники кліків
    document.querySelectorAll('.term-card').forEach(card => {
        card.addEventListener('click', () => {
            const termId = card.dataset.id;
            window.location.href = `term.html?id=${termId}`;
        });
    });
}

/**
 * Створення картки терміну
 */
function createTermCard(term) {
    const acronymEN = term.Acronym || '';
    const acronymUK = term['Абревіатура'] || '';
    const termEN = term.Term || '';
    const termUK = term['Термін'] || '';
    const definition = term.Definition || '';
    const definitionUK = term['Визначення'] || '';
    
    // Перший рядок: акроніми (якщо є)
    const acronymsHTML = (acronymEN || acronymUK) ? `
        <div class="term-acronym-row">
            ${acronymEN ? `<span class="acronym">${escapeHtml(acronymEN)}</span>` : ''}
            ${acronymUK ? `<span class="acronym acronym-uk">${escapeHtml(acronymUK)}</span>` : ''}
        </div>
    ` : '';

    // Другий рядок: терміни EN та UK
    const termsHTML = `
        <div class="term-names-row">
            ${termEN ? `<div class="term-name">${escapeHtml(termEN)}</div>` : ''}
            ${termUK ? `<div class="term-name-uk">${escapeHtml(termUK)}</div>` : ''}
        </div>
    `;

    // Третій рядок: preview визначення (опціонально)
    const preview = definition || definitionUK || '';
    const previewText = preview.length > 150 ? preview.substring(0, 150) + '...' : preview;

    return `
        <div class="term-card" data-id="${term._id}">
            ${acronymsHTML}
            ${termsHTML}
            ${preview ? `<div class="term-preview">${escapeHtml(previewText)}</div>` : ''}
        </div>
    `;
}

/**
 * Завантаження деталей терміну
 */
async function loadTermDetail(termId) {
    try {
        const term = await getTermById(termId);
        
        if (!term) {
            document.getElementById('termDetail').innerHTML = 
                '<div class="error">Термін не знайдено</div>';
            return null;
        }

        // Встановлюємо заголовок - тільки англійський термін
        const title = term.Term || 'Термін';
        document.getElementById('termTitle').textContent = title;
        renderTermDetail(term);
        return term;
    } catch (error) {
        document.getElementById('termDetail').innerHTML = 
            `<div class="error">Помилка: ${error.message}</div>`;
        return null;
    }
}

/**
 * Відображення деталей терміну
 */
function renderTermDetail(term) {
    const container = document.getElementById('termDetail');
    
    const acronymEN = term.Acronym || '';
    const acronymUK = term['Абревіатура'] || '';
    const source = term['Source / Link'] || '';
    
    let html = '<div class="term-detail">';
    
    // Акроніми (EN та UK разом)
    if (acronymEN || acronymUK) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Абревіатура</div>
                <div class="detail-acronyms">
                    ${acronymEN ? `<span class="acronym">${escapeHtml(acronymEN)}</span>` : ''}
                    ${acronymUK ? `<span class="acronym acronym-uk">${escapeHtml(acronymUK)}</span>` : ''}
                </div>
            </div>
        `;
    }
    
    // Терміни (EN та UK паралельно)
    if (term.Term || term['Термін']) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Термін</div>
                <div class="detail-bilingual">
                    ${term.Term ? `
                        <div class="bilingual-item">
                            <div class="bilingual-lang">EN</div>
                            <div class="bilingual-value">${escapeHtml(term.Term)}</div>
                        </div>
                    ` : ''}
                    ${term['Термін'] ? `
                        <div class="bilingual-item">
                            <div class="bilingual-lang">UK</div>
                            <div class="bilingual-value">${escapeHtml(term['Термін'])}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    // Визначення (EN та UK паралельно)
    if (term.Definition || term['Визначення']) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Визначення</div>
                <div class="detail-bilingual">
                    ${term.Definition ? `
                        <div class="bilingual-item">
                            <div class="bilingual-lang">EN</div>
                            <div class="bilingual-value">${escapeHtml(term.Definition)}</div>
                        </div>
                    ` : ''}
                    ${term['Визначення'] ? `
                        <div class="bilingual-item">
                            <div class="bilingual-lang">UK</div>
                            <div class="bilingual-value">${escapeHtml(term['Визначення'])}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    // Примітки (EN та UK паралельно)
    if (term.Notes || term['Примітки']) {
        html += `
            <div class="detail-section">
                <div class="detail-label">Примітки</div>
                <div class="detail-bilingual">
                    ${term.Notes ? `
                        <div class="bilingual-item">
                            <div class="bilingual-lang">EN</div>
                            <div class="bilingual-value">${escapeHtml(term.Notes)}</div>
                        </div>
                    ` : ''}
                    ${term['Примітки'] ? `
                        <div class="bilingual-item">
                            <div class="bilingual-lang">UK</div>
                            <div class="bilingual-value">${escapeHtml(term['Примітки'])}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    // Джерело (внизу)
    if (source) {
        const isUrl = source.startsWith('http://') || source.startsWith('https://');
        html += `
            <div class="detail-section detail-source">
                <div class="detail-label">Джерело</div>
                <div class="detail-value">
                    ${isUrl ? `<a href="${escapeHtml(source)}" target="_blank" rel="noopener" class="source-link">${escapeHtml(source)}</a>` : escapeHtml(source)}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Налаштування пошуку
 */
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const debouncedSearch = debounceSearch((query) => {
        filteredTerms = searchTerms(allTerms, query);
        filteredTerms = sortTerms(filteredTerms);
        renderTerms(filteredTerms);
        updateStats(filteredTerms.length);
    }, CONFIG.DEBOUNCE_DELAY);

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    // Пошук по Enter (миттєвий)
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(searchTimeout);
            const query = e.target.value;
            filteredTerms = searchTerms(allTerms, query);
            filteredTerms = sortTerms(filteredTerms);
            renderTerms(filteredTerms);
            updateStats(filteredTerms.length);
        }
    });
}

/**
 * Оновлення статистики
 */
function updateStats(count) {
    const statsEl = document.getElementById('stats');
    if (statsEl) {
        statsEl.innerHTML = `<span id="totalCount">${count}</span> термінів`;
    }
}

/**
 * Налаштування модальних вікон
 */
function setupModal() {
    const suggestBtn = document.getElementById('suggestBtn');
    if (suggestBtn) {
        suggestBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const formUrl = CONFIG.SUGGEST_FORM_URL;
            document.getElementById('feedbackForm').src = formUrl;
            document.getElementById('suggestModal').style.display = 'block';
        });
    }

    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').style.display = 'none';
        });
    });

    // Закриття по кліку поза модальним вікном
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

/**
 * Показ помилки
 */
function showError(message) {
    const listContainer = document.getElementById('termsList');
    if (listContainer) {
        listContainer.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
    }
}

/**
 * Екранування HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Перевірка назв листів (для діагностики)
 */
async function checkSheetNames() {
    try {
        const names = await getSheetNames();
        alert('Доступні листи в таблиці:\n\n' + names.join('\n') + 
              '\n\nПоточна назва в config.js: "' + CONFIG.TERMS_SHEET + '"');
    } catch (error) {
        alert('Помилка: ' + error.message);
    }
}

