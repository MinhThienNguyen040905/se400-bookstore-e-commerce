import moment from 'moment';
import qs from 'qs';
import crypto from 'crypto';
import vnpayConfig from '../config/vnpay.js';

const sortObject = (obj) => {
    const sorted = {};
    const keys = [];

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            keys.push(encodeURIComponent(key));
        }
    }

    keys.sort();

    for (const key of keys) {
        sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    }

    return sorted;
};

const signParams = (params) => {
    const signData = qs.stringify(params, { encode: false });
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);

    return hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
};

const createPaymentUrl = ({ orderId, amount, ipAddress }) => {
    let vnpParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: vnpayConfig.vnp_TmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan don hang #${orderId}`,
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
        vnp_IpAddr: ipAddress || '127.0.0.1',
        vnp_CreateDate: moment().format('YYYYMMDDHHmmss')
    };

    vnpParams = sortObject(vnpParams);
    vnpParams.vnp_SecureHash = signParams(vnpParams);

    return `${vnpayConfig.vnp_Url}?${qs.stringify(vnpParams, { encode: false })}`;
};

const verifyReturnParams = (query) => {
    let params = { ...query };
    const secureHash = params.vnp_SecureHash;

    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    params = sortObject(params);

    return {
        isValid: secureHash === signParams(params),
        params
    };
};

export default { createPaymentUrl, verifyReturnParams };
