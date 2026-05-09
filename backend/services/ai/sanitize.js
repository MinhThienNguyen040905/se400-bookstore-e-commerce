const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const PHONE_RE = /(?:\+?84|0)(?:[\s.-]?\d){8,10}/g;
const CREDIT_CARD_RE = /\b(?:\d[ -]*?){13,19}\b/g;

const REPEATED_CHAR_RE = /(.)\1{3,}/g;
const REPEATED_PUNCT_RE = /([!?.,])\1{2,}/g;
const MULTI_WHITESPACE_RE = /\s+/g;
const ZERO_WIDTH_RE = /[​-‍﻿]/g;

export const sanitizePii = (text) => {
    if (typeof text !== 'string' || !text) return '';
    return text
        .replace(EMAIL_RE, '[email]')
        .replace(URL_RE, '[url]')
        .replace(CREDIT_CARD_RE, '[card]')
        .replace(PHONE_RE, '[phone]');
};

export const normalizeText = (text) => {
    if (typeof text !== 'string' || !text) return '';
    return text
        .normalize('NFC')
        .replace(ZERO_WIDTH_RE, '')
        .replace(REPEATED_CHAR_RE, '$1$1$1')
        .replace(REPEATED_PUNCT_RE, '$1$1')
        .replace(MULTI_WHITESPACE_RE, ' ')
        .trim();
};

export const sanitizeAndNormalize = (text) => normalizeText(sanitizePii(text));
