import statsService from '../services/statsService.js';

const getStats = async (req, res) => {
    const result = await statsService.getStats();
    res.success(result, 'Lay thong ke thanh cong');
};

const getAiInsights = async (req, res) => {
    const result = await statsService.getAiInsights({
        suspiciousLimit: req.query.suspiciousLimit,
        recentWindowDays: req.query.windowDays
    });
    res.success(result, 'Lay AI insights thanh cong');
};

export default { getStats, getAiInsights };
