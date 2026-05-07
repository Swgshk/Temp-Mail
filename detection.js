function findEmailInputs() {
    // Ищем все возможные поля ввода email
    const selectors = [
        'input[type="email"]',
        'input[name*="email" i]',
        'input[name*="mail" i]',
        'input[placeholder*="email" i]',
        'input[placeholder*="mail" i]',
        'input[id*="email" i]',
        'input[id*="mail" i]',
        'input[class*="email" i]',
        'input[class*="mail" i]'
    ];
    let inputs = [];
    for (let sel of selectors) {
        inputs.push(...document.querySelectorAll(sel));
    }
    // Убираем дубликаты
    return [...new Set(inputs)];
}