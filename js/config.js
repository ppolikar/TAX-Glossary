// Конфігурація проекту
// Детальна інструкція: дивіться SETUP_GUIDE.md
// 
// ⚠️ БЕЗПЕКА: Цей файл містить API ключ, який видимий у публічному репозиторії.
// Обов'язково налаштуйте обмеження для API ключа в Google Cloud Console:
// 1. Обмежте ключ тільки до "Google Sheets API"
// 2. Додайте обмеження по HTTP referrer (тільки ваші домени)
// Детальні інструкції: дивіться SECURITY.md
//
const CONFIG = {
    // Google Sheets API
    // КРОК 1: Отримайте API ключ на https://console.cloud.google.com/
    //   - Створіть проект → APIs & Services → Library → Google Sheets API → Enable
    //   - Credentials → Create Credentials → API Key
    //   - Обмежте ключ до "Google Sheets API"
    API_KEY: 'AIzaSyD33zzQZ438Kjsv9UqSoxi0yeBxYoyLX8E', // API ключ Google Sheets
    
    // КРОК 2: Отримайте Sheet ID з URL вашої таблиці
    //   URL: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
    //   Скопіюйте частину між /d/ та /edit
    SHEET_ID: '1fTv0aPCdfsS5zeDMTPyqfeeyoIS-n9P6sKhHuBVrDkE', // Замініть на ID вашої таблиці
    
    // КРОК 3: Перевірте назву листа в Google таблиці
    TERMS_SHEET: 'DATA', // Назва листа з термінами (за замовчуванням "Terms")
    FEEDBACK_SHEET: 'Feedback', // Назва листа для feedback (опціонально)
    
    // Google Forms URLs (опціонально - можна налаштувати пізніше)
    // Створіть Google Forms для збору зворотного зв'язку
    // Скопіюйте URL форми та вставте нижче
    SUGGEST_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLScyqjWLzFdK0UxfPYcQtdoUriu0QCzWhsNYy4jrqCiebCzuRA/viewform?embedded=true',
    ERROR_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSejKrjkpGtMNwBTfJb8FFWMPo-HIVl4D2t18tygLlkZf2_Gdg/viewform?embedded=true',
    
    // Поля форми помилки (якщо потрібно передавати Term ID автоматично)
    // Знайдіть ID поля в URL форми (після entry.) та вставте нижче
    ERROR_FORM_TERM_ID_FIELD: '306186669', // ID поля для назви терміну в формі
    
    // Налаштування
    CACHE_DURATION: 60 * 60 * 1000, // 1 година в мілісекундах
    DEBOUNCE_DELAY: 300 // Затримка для пошуку в мс
};

