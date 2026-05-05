import wishlistService from '../services/wishlistService.js';

const toggleWishlist = async (req, res) => {
    const result = await wishlistService.toggleWishlist({
        userId: req.user.user_id,
        bookId: req.body.book_id
    });

    const message = result.action === 'removed'
        ? 'Da xoa khoi danh sach yeu thich'
        : 'Da them vao danh sach yeu thich';

    return res.success(result, message);
};

const getWishlist = async (req, res) => {
    const result = await wishlistService.getWishlist({ userId: req.user.user_id });
    res.success(result, 'Lay danh sach yeu thich thanh cong');
};

export default { toggleWishlist, getWishlist };
