import promoService from '../services/promoService.js';

const addPromo = async (req, res) => {
    const result = await promoService.addPromo(req.body);
    res.success(result, 'Them ma khuyen mai thanh cong', 201);
};

const getPromos = async (req, res) => {
    const result = await promoService.getPromos();
    res.success(result, 'Lay danh sach ma khuyen mai thanh cong');
};

const getAllPromos = async (req, res) => {
    const result = await promoService.getAllPromos({
        page: req.query.page,
        limit: req.query.limit
    });

    res.success(result, 'Lay tat ca ma khuyen mai thanh cong');
};

const getPromoByCode = async (req, res) => {
    const result = await promoService.getPromoByCode(req.body);
    res.success(result, 'Ma khuyen mai hop le');
};

export default {
    addPromo,
    getPromos,
    getAllPromos,
    getPromoByCode
};
