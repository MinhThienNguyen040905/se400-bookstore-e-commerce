import {
    parseOptionalString,
    parseRequiredString
} from './common.js';

const createVnpayPayment = (body) => ({
    address: parseRequiredString(body.address, 'address'),
    phone: parseRequiredString(body.phone, 'phone'),
    promoCode: parseOptionalString(body.promo_code)
});

export default {
    createVnpayPayment
};
