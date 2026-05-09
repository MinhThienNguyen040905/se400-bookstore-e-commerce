const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const PHONE_RE = /(?:\+?84|0)(?:[\s.-]?\d){8,10}/g;
const CREDIT_CARD_RE = /\b(?:\d[ -]*?){13,19}\b/g;

export const sanitizePii = (text) => {
    if (typeof text !== 'string' || !text) return '';
    return text
        .replace(EMAIL_RE, '[email]')
        .replace(URL_RE, '[url]')
        .replace(CREDIT_CARD_RE, '[card]')
        .replace(PHONE_RE, '[phone]');
};
