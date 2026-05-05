// config/vnpay.js
import 'dotenv/config';

const vnpayConfig = {
    vnp_TmnCode: process.env.VNP_TMNCODE,
    vnp_HashSecret: process.env.VNP_HASHSECRET,
    vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_ReturnUrl: 'http://localhost:3000/api/payment/vnpay_return'
};

export default vnpayConfig;

