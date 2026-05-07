# Temp-Mail

# Temp-Mail

# 📧 Temp Mail Autofill / Временная почта

Browser extension for automatically generating a temporary email address, inserting it into any email field, and receiving incoming messages right in the popup.

Расширение для автоматической генерации временного email‑адреса, вставки в любое поле ввода почты и получения входящих писем прямо в попапе.

---

## 🇷🇺 Русский

### Возможности
- 🔄 Генерация случайного email через API (Mail.tm)
- 📋 Быстрая вставка email в поля `input[type="email"]` с помощью кнопки-эмодзи 📧, расположенной **внутри поля** (справа)
- 📬 Просмотр списка писем и полного содержимого (HTML + текст)
- 🔗 Кликабельные ссылки из писем открываются в новой вкладке
- 🌐 Поддержка двух языков: **русский** и **английский** (переключатель в шапке попапа, сохраняет выбор)
- 🧩 Работает на любых сайтах (включая SPA с динамическими формами)
- 🎨 Чистый минималистичный интерфейс попапа

### Установка (Firefox)
1. Скачайте все файлы расширения
2. Откройте `about:debugging` → «Этот Firefox» → «Загрузить временное дополнение»
3. Выберите `manifest.json`
4. Расширение появится на панели инструментов

### Использование
- **На сайте**: кликните по любому полю ввода email → внутри поля справа появится кнопка 📧 → нажмите её → временный email вставится.
- **В попапе**: откройте расширение → увидите текущий email → кнопки «Новый email» и «Обновить письма» → клик по письму откроет его содержимое.
- **Переключение языка**: кнопка в правом верхнем углу попапа (🇬🇧 EN / 🇷🇺 RU). Выбор сохраняется.

### Технологии
- Manifest V3
- Mail.tm API (https://api.mail.tm)
- vanilla JavaScript

### Возможные проблемы
- **Кнопка не появляется** – проверьте, что `detection.js` загружается раньше `content.js` в `content_scripts`. Перезагрузите расширение.
- **Не грузятся письма** – временная недоступность `api.mail.tm`.
- **Ошибка создания email** – откройте консоль background (`about:debugging` → расширение → Инспектировать).

### Структура проекта
temp-mail-extension/
├── manifest.json # Конфигурация расширения (Manifest V3)
├── background.js # Service worker (работа с API Mail.tm)
├── content.js # Внедрение кнопки в email-поля на сайтах
├── utils/
│ └── detection.js # Поиск полей ввода email
├── popup/
│ ├── popup.html # Интерфейс окна расширения
│ └── popup.js # Логика попапа (письма, языки)
└── icons/ # Иконки расширения (опционально)
└── 123icon.png

---

## 🇬🇧 English

### Features
- 🔄 Random email generation via Mail.tm API
- 📋 One‑click insertion into any email input (button **inside the field**, 📧)
- 📬 Receive and read messages (HTML/text) inside popup
- 🔗 Links in emails open in new tab
- 🌐 Two languages: **Russian** and **English** (switch in popup header, saves preference)
- 🧩 Works on all websites (including SPAs)
- 🎨 Clean minimal popup design

### Installation (Firefox)
1. Download all extension files
2. Open `about:debugging` → “This Firefox” → “Load Temporary Add‑on”
3. Select `manifest.json`
4. The extension appears on the toolbar

### Usage
- **On a website**: click any email input → a 📧 button appears inside the field (right side) → click it → temporary email is inserted.
- **In the popup**: open extension → see current email → buttons “New email” and “Refresh messages” → click a message to read it.
- **Switch language**: button in top‑right corner of the popup (🇬🇧 EN / 🇷🇺 RU). Choice is saved.

### Technologies
- Manifest V3
- Mail.tm API (https://api.mail.tm)
- vanilla JavaScript

### Troubleshooting
- **Button does not appear** – make sure `detection.js` is loaded before `content.js` in `content_scripts`. Reload extension.
- **Messages not loading** – temporary issue with `api.mail.tm`.
- **Error creating email** – inspect background console (`about:debugging` → extension → Inspect).

### Project structure

temp-mail-extension/
├── manifest.json # Extension manifest (Manifest V3)
├── background.js # Service worker (Mail.tm API)
├── content.js # Injects button into email fields
├── utils/
│ └── detection.js # Finds email input fields
├── popup/
│ ├── popup.html # Popup UI
│ └── popup.js # Popup logic (messages, languages)
└── icons/ # Optional icons
└── 123icon.png
---

## 📜 License
MIT

## 🙌 Credits
Powered by [Mail.tm](https://mail.tm)
