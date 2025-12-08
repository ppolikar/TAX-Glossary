# Словник податкових термінів

Веб-застосунок для пошуку та перегляду перекладів податкової термінології EN ↔ UA.

## Налаштування

### 1. Google Sheets API

1. Перейдіть до [Google Cloud Console](https://console.cloud.google.com/)
2. Створіть новий проект або виберіть існуючий
3. Увімкніть **Google Sheets API**
4. Створіть **API ключ** (Credentials → Create Credentials → API Key)
5. Обмежте ключ до **Google Sheets API** (для безпеки)

### 2. Отримання Sheet ID

1. Відкрийте вашу Google таблицю
2. З URL скопіюйте ID (між `/d/` та `/edit`)
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```

### 3. Налаштування конфігурації

Відкрийте `js/config.js` та замініть:

- `API_KEY` - ваш API ключ з Google Cloud Console
- `SHEET_ID` - ID вашої таблиці
- `TERMS_SHEET` - назва листа з термінами (за замовчуванням "Terms")
- `FEEDBACK_SHEET` - назва листа для feedback (за замовчуванням "Feedback")

### 4. Google Forms для зворотного зв'язку

#### Форма для пропозиції нового терміну:

1. Створіть Google Form
2. Додайте поля:
   - Term or Acronym (EN) [Обов'язкове]
   - Термін або абревіатура (UA) [Опціональне]
   - Comment / Source [Опціональне]
3. Налаштуйте відповіді на лист "Feedback"
4. Скопіюйте URL форми та вставте в `SUGGEST_FORM_URL`

#### Форма для повідомлення про помилку:

1. Створіть Google Form
2. Додайте поля:
   - Term ID [Автоматично заповнюється]
   - Comment / Corrected version [Обов'язкове]
3. Налаштуйте відповіді на лист "Feedback"
4. Скопіюйте URL форми та вставте в `ERROR_FORM_URL`

**Примітка:** Якщо потрібно передавати Term ID автоматично, знайдіть ID поля в URL форми (після `entry.`) та вставте в `ERROR_FORM_TERM_ID_FIELD`.

### 5. Структура Google Sheets

#### Лист "Terms" (обов'язковий):

Заголовки колонок:
- Status
- Source / Link
- Acronym
- Term
- Definition
- Notes
- Абревіатура
- Термін
- Визначення
- Примітки

**Важливо:** Терміни зі статусом "Draft" не відображаються для читачів.

#### Лист "Feedback" (опціональний):

Використовується для збору зворотного зв'язку через Google Forms.

## Деплой на GitHub Pages

1. Створіть репозиторій на GitHub
2. Завантажте всі файли проекту
3. Перейдіть до Settings → Pages
4. Виберіть гілку `main` та папку `/ (root)`
5. Сайт буде доступний за адресою: `https://username.github.io/repository-name/`

**Важливо:** Не комітьте API ключ у публічний репозиторій! Використовуйте обмежений API ключ (тільки для Google Sheets API) або розгляньте використання GitHub Secrets (для більш складних налаштувань).

## Локальний запуск

Просто відкрийте `index.html` у браузері або використайте локальний сервер:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server
```

Потім відкрийте `http://localhost:8000`

**Примітка:** Через CORS обмеження, для роботи з Google Sheets API може знадобитися локальний сервер.

## Функціонал

- ✅ Мультипошук по всіх полях
- ✅ Детальна картка терміну
- ✅ Фільтрація Draft термінів
- ✅ Mobile First дизайн
- ✅ Кешування даних (localStorage)
- ✅ Пропозиція нових термінів (через Google Forms)
- ✅ Повідомлення про помилки (через Google Forms)
- ✅ Алфавітне сортування за Term (EN)

## Структура проекту

```
tax-glossary/
├── index.html              # Головна сторінка
├── term.html               # Детальна картка терміну
├── css/
│   └── styles.css          # Стилі (Mobile First)
├── js/
│   ├── config.js           # Конфігурація
│   ├── sheets-api.js       # Робота з Google Sheets API
│   ├── search.js           # Логіка пошуку
│   └── app.js              # Основна логіка
└── README.md               # Документація
```

## Підтримка

Для питань та пропозицій створюйте Issues у репозиторії.


