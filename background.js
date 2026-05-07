const browserAPI = typeof browser !== "undefined" ? browser : chrome;
const API_URL = "https://api.mail.tm";

// Хранилище для email и пароля
async function setAccount(email, password) {
    return browserAPI.storage.local.set({ email, password });
}

async function getAccount() {
    const data = await browserAPI.storage.local.get(["email", "password"]);
    return { email: data.email, password: data.password };
}

// === API ФУНКЦИИ ===

async function generateEmail() {
    try {
        // 1. Получаем список доступных доменов
        const domainsRes = await fetch(`${API_URL}/domains`);
        const domains = await domainsRes.json();
        const domain = domains['hydra:member'][0].domain;

        // 2. Генерируем случайное имя
        const name = Math.random().toString(36).substring(2, 15);
        const email = `${name}@${domain}`;

        // 3. Создаём аккаунт с этим email
        const password = Math.random().toString(36).substring(2, 15);
        const accountRes = await fetch(`${API_URL}/accounts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: email, password: password })
        });
        
        if (!accountRes.ok) throw new Error("Failed to create account");
        
        return { email, password };
    } catch (e) {
        console.error("Generate email error:", e);
        return null;
    }
}

async function getToken(email, password) {
    const res = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: email, password: password })
    });
    const data = await res.json();
    return data.token;
}

async function getMessages(email, password) {
    try {
        const token = await getToken(email, password);
        if (!token) return [];
        
        const res = await fetch(`${API_URL}/messages`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        return data['hydra:member'] || [];
    } catch (e) {
        console.error("Get messages error:", e);
        return [];
    }
}

async function getMessage(email, password, id) {
    try {
        const token = await getToken(email, password);
        if (!token) return null;
        
        const res = await fetch(`${API_URL}/messages/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        return await res.json();
    } catch (e) {
        console.error("Read message error:", e);
        return null;
    }
}

// === ОБРАБОТЧИК СООБЩЕНИЙ ===
browserAPI.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    (async () => {
        try {
            if (msg.type === "GET_EMAIL") {
                let { email, password } = await getAccount();
                if (!email) {
                    const newAccount = await generateEmail();
                    if (newAccount) {
                        await setAccount(newAccount.email, newAccount.password);
                        sendResponse(newAccount.email);
                    } else {
                        sendResponse(null);
                    }
                } else {
                    sendResponse(email);
                }
                return;
            }

            if (msg.type === "NEW_EMAIL") {
                const newAccount = await generateEmail();
                if (newAccount) {
                    await setAccount(newAccount.email, newAccount.password);
                    sendResponse(newAccount.email);
                } else {
                    sendResponse(null);
                }
                return;
            }

            if (msg.type === "GET_MESSAGES") {
                const { email, password } = await getAccount();
                if (!email || !password) {
                    sendResponse([]);
                    return;
                }
                const messages = await getMessages(email, password);
                sendResponse(messages);
                return;
            }

            if (msg.type === "READ_MESSAGE") {
                const { email, password } = await getAccount();
                if (!email || !password || !msg.id) {
                    sendResponse(null);
                    return;
                }
                const message = await getMessage(email, password, msg.id);
                sendResponse(message);
                return;
            }
        } catch (e) {
            console.error("BG ERROR:", e);
            sendResponse(null);
        }
    })();
    return true; // Указывает на асинхронный ответ
});