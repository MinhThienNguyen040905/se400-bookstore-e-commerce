import statsService from '../services/statsService.js';

const getStats = async (req, res) => {
    const result = await statsService.getStats();
    res.success(result, 'Lay thong ke thanh cong');
};

export default { getStats };
