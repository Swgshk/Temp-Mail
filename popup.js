const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// ---------- Языковые ресурсы ----------
const translations = {
    ru: {
        appName: "📧 Temp Mail",
        newEmailBtn: "✨ Новый email",
        refreshBtn: "🔄 Обновить письма",
        loading: "⏳ Загрузка...",
        noMessages: "📭 Нет писем",
        errorNoEmail: "⚠️ Нет email, создайте новый",
        errorLoadFailed: "⚠️ Ошибка загрузки писем",
        errorCreateFailed: "⚠️ Не удалось создать email",
        errorOpenFailed: "⚠️ Не удалось загрузить письмо",
        copyTitle: "Копировать",
        backBtn: "← Назад",
        fromLabel: "От:",
        dateLabel: "Дата:",
        unknownSender: "Неизвестный",
        noSubject: "(без темы)",
        emptyBody: "(текст отсутствует)"
    },
    en: {
        appName: "📧 Temp Mail",
        newEmailBtn: "✨ New email",
        refreshBtn: "🔄 Refresh messages",
        loading: "⏳ Loading...",
        noMessages: "📭 No messages",
        errorNoEmail: "⚠️ No email, create a new one",
        errorLoadFailed: "⚠️ Failed to load messages",
        errorCreateFailed: "⚠️ Failed to create email",
        errorOpenFailed: "⚠️ Failed to load message",
        copyTitle: "Copy",
        backBtn: "← Back",
        fromLabel: "From:",
        dateLabel: "Date:",
        unknownSender: "Unknown",
        noSubject: "(no subject)",
        emptyBody: "(empty)"
    }
};

let currentLang = 'ru';
let currentState = { type: 'messages', messages: null, messageId: null }; // для восстановления при смене языка

// Загружаем сохранённый язык
async function loadLanguage() {
    const data = await browserAPI.storage.local.get('lang');
    if (data.lang && translations[data.lang]) {
        currentLang = data.lang;
    } else {
        currentLang = 'ru';
    }
    applyLanguage(currentLang);
}

// Сохраняем язык
async function saveLanguage(lang) {
    await browserAPI.storage.local.set({ lang });
    currentLang = lang;
    applyLanguage(lang);
    // Обновляем текущее отображение с новым языком
    refreshCurrentView();
}

// Применяем перевод ко всем элементам с data-i18n и кнопке переключателя
function applyLanguage(lang) {
    const t = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    const langBtn = document.getElementById('langSwitch');
    if (lang === 'ru') langBtn.textContent = '🇬🇧 EN';
    else langBtn.textContent = '🇷🇺 RU';
    document.querySelector('h1').textContent = t.appName;
    const copyBtn = document.getElementById('copyEmailBtn');
    copyBtn.title = t.copyTitle;
}

// Переключение языка
function toggleLanguage() {
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    saveLanguage(newLang);
}

// Обновить текущее представление в зависимости от сохранённого состояния
async function refreshCurrentView() {
    if (currentState.type === 'messages') {
        if (currentState.messages === undefined) {
            // ещё не загружены, покажем загрузку
            showLoading();
        } else if (currentState.messages === null) {
            showError('errorLoadFailed');
        } else {
            renderMessagesList(currentState.messages);
        }
    } else if (currentState.type === 'message' && currentState.messageId) {
        await openMessageDetail(currentState.messageId, true); // skipLoading чтобы не мигать
    }
}

// ---------- Остальная логика ----------
const emailInput = document.getElementById('email');
const copyBtn = document.getElementById('copyEmailBtn');
const newBtn = document.getElementById('newBtn');
const refreshBtn = document.getElementById('refreshBtn');
const mainContent = document.getElementById('mainContent');

function showLoading() {
    const t = translations[currentLang];
    mainContent.innerHTML = `<div class="messages-container"><div class="empty-messages">${t.loading}</div></div>`;
    currentState = { type: 'messages', messages: undefined };
}

function showError(msgKey) {
    const t = translations[currentLang];
    mainContent.innerHTML = `<div class="messages-container"><div class="empty-messages" style="color:#d9534f;">${t[msgKey] || msgKey}</div></div>`;
    currentState = { type: 'messages', messages: null };
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString(currentLang === 'ru' ? 'ru-RU' : 'en-US');
}

function renderMessagesList(messages) {
    const t = translations[currentLang];
    if (!messages || messages.length === 0) {
        mainContent.innerHTML = `<div class="messages-container"><div class="empty-messages">${t.noMessages}</div></div>`;
        currentState = { type: 'messages', messages: [] };
        return;
    }
    const container = document.createElement('div');
    container.className = 'messages-container';
    for (const msg of messages) {
        const card = document.createElement('div');
        card.className = 'message-card';
        card.innerHTML = `
            <div class="message-from">
                <span>📨 ${escapeHtml(msg.from?.address || t.unknownSender)}</span>
                <span class="message-date">${escapeHtml(formatDate(msg.createdAt))}</span>
            </div>
            <div class="message-subject">${escapeHtml(msg.subject || t.noSubject)}</div>
        `;
        card.addEventListener('click', () => openMessageDetail(msg.id));
        container.appendChild(card);
    }
    mainContent.innerHTML = '';
    mainContent.appendChild(container);
    currentState = { type: 'messages', messages: messages };
}

async function openMessageDetail(id, skipLoading = false) {
    if (!skipLoading) showLoading();
    try {
        const msg = await browserAPI.runtime.sendMessage({ type: "READ_MESSAGE", id });
        if (!msg) {
            showError("errorOpenFailed");
            return;
        }
        const t = translations[currentLang];
        let bodyHTML = msg.html || msg.text || t.emptyBody;
        if (!msg.html && msg.text) {
            bodyHTML = `<pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(msg.text)}</pre>`;
        }
        const detailDiv = document.createElement('div');
        detailDiv.className = 'detail-view';
        detailDiv.innerHTML = `
            <div class="detail-header">
                <button class="back-btn">${t.backBtn}</button>
                <span></span>
            </div>
            <div class="detail-subject">${escapeHtml(msg.subject || t.noSubject)}</div>
            <div class="detail-meta">
                <strong>${t.fromLabel}</strong> ${escapeHtml(msg.from?.address || '—')}<br>
                <strong>${t.dateLabel}</strong> ${escapeHtml(formatDate(msg.createdAt))}
            </div>
            <div class="detail-body"></div>
        `;
        const bodyContainer = document.createElement('div');
        bodyContainer.innerHTML = bodyHTML;
        bodyContainer.querySelectorAll('a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
        detailDiv.querySelector('.detail-body').appendChild(bodyContainer);
        detailDiv.querySelector('.back-btn').addEventListener('click', () => refreshMessages());
        mainContent.innerHTML = '';
        mainContent.appendChild(detailDiv);
        currentState = { type: 'message', messageId: id };
    } catch (err) {
        console.error(err);
        showError("errorOpenFailed");
    }
}

async function loadEmail() {
    try {
        const email = await browserAPI.runtime.sendMessage({ type: "GET_EMAIL" });
        emailInput.value = email || 'Ошибка';
    } catch (e) {
        emailInput.value = 'Ошибка';
    }
}

async function refreshMessages() {
    const email = emailInput.value;
    if (!email || email === 'Ошибка') {
        showError("errorNoEmail");
        return;
    }
    showLoading();
    try {
        const messages = await browserAPI.runtime.sendMessage({ type: "GET_MESSAGES" });
        renderMessagesList(messages || []);
    } catch (e) {
        showError("errorLoadFailed");
    }
}

async function createNewEmail() {
    showLoading();
    try {
        const email = await browserAPI.runtime.sendMessage({ type: "NEW_EMAIL" });
        if (email) {
            emailInput.value = email;
            renderMessagesList([]);
        } else {
            showError("errorCreateFailed");
        }
    } catch (e) {
        showError("errorCreateFailed");
    }
}

function copyEmail() {
    emailInput.select();
    navigator.clipboard.writeText(emailInput.value);
    const original = copyBtn.textContent;
    copyBtn.textContent = '✅';
    setTimeout(() => copyBtn.textContent = original, 800);
}

async function initPopup() {
    await loadLanguage();
    await loadEmail();
    await refreshMessages();
}

newBtn.addEventListener('click', createNewEmail);
refreshBtn.addEventListener('click', refreshMessages);
copyBtn.addEventListener('click', copyEmail);
emailInput.addEventListener('click', copyEmail);
document.getElementById('langSwitch').addEventListener('click', toggleLanguage);

initPopup();