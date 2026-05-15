export const sanitizeInput = (str, maxLength = 200) => {
    if (!str) return '';
    return String(str)
        .replace(/[<>"{}`]/g, '')
        .trim()
        .substring(0, maxLength);
};

export const sanitizeNumeric = (val, min = 0, max = 999999) => {
    const num = parseFloat(val);
    if (isNaN(num)) return min;
    return Math.max(min, Math.min(num, max));
};

export const sanitizeEmail = (str) => {
    return String(str).trim().toLowerCase();
};
