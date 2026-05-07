const browserAPI = typeof browser !== "undefined" ? browser : chrome;

function createButton(input) {
    if (input.dataset.tempMailAttached === 'true') return;

    const btn = document.createElement('button');
    btn.textContent = '📧';
    btn.title = 'Вставить временную почту';
    // Без фона, без рамки, только крупный эмодзи
    btn.style.cssText = `
        position: absolute;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 24px;
        padding: 0;
        margin: 0;
        width: auto;
        height: auto;
        opacity: 0.6;
        transition: opacity 0.1s;
        z-index: 1000;
    `;
    btn.onmouseenter = () => btn.style.opacity = '1';
    btn.onmouseleave = () => btn.style.opacity = '0.6';
    btn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const email = await browserAPI.runtime.sendMessage({ type: "GET_EMAIL" });
            if (email) {
                input.value = email;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.style.backgroundColor = '#e6ffed';
                setTimeout(() => input.style.backgroundColor = '', 300);
            }
        } catch (err) {
            console.error('[TempMail]', err);
        }
    };

    const parent = input.parentNode;
    const parentStyle = window.getComputedStyle(parent);
    if (parentStyle.position !== 'relative' && parentStyle.position !== 'absolute' && parentStyle.position !== 'fixed') {
        parent.style.position = 'relative';
    }
    // Увеличиваем отступ справа, чтобы текст не наезжал на иконку
    if (!input.dataset.originalPadding) {
        input.dataset.originalPadding = window.getComputedStyle(input).paddingRight;
        input.style.paddingRight = '32px';
    }
    parent.appendChild(btn);
    input.dataset.tempMailAttached = 'true';
}

function init() {
    const inputs = findEmailInputs();
    inputs.forEach(createButton);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

new MutationObserver(() => {
    const inputs = findEmailInputs();
    inputs.forEach(input => {
        if (!input.dataset.tempMailAttached) createButton(input);
    });
}).observe(document.body, { childList: true, subtree: true });