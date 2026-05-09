import recommendationService from '../services/recommendationService.js';
import recommendationValidator from '../validators/recommendationValidator.js';

const getPersonalized = async (req, res) => {
    const input = recommendationValidator.list(req.query);
    const result = await recommendationService.getPersonalizedRecommendations({
        userId: req.user?.user_id,
        limit: input.limit
    });

    res.success(result, 'Lay goi y ca nhan thanh cong');
};

const getTrending = async (req, res) => {
    const input = recommendationValidator.list(req.query);
    const result = await recommendationService.getTrendingRecommendations({ limit: input.limit });

    res.success(result, 'Lay goi y dang thinh hanh thanh cong');
};

const getSimilarBooks = async (req, res) => {
    const input = recommendationValidator.similar(req.params, req.query);
    const result = await recommendationService.getSimilarBooks(input);

    res.success(result, 'Lay goi y sach tuong tu thanh cong');
};

export default {
    getPersonalized,
    getTrending,
    getSimilarBooks
};
