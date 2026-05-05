// controllers/wishlistController.js
import Wishlist from '../models/Wishlist.js';
import Book from '../models/Book.js';
import Author from '../models/Author.js';

// === TOGGLE WISHLIST ===
// Add or remove a book from user's wishlist
const toggleWishlist = async (req, res) => {
    const { book_id } = req.body;
    const user_id = req.user.user_id; // From auth middleware

    try {
        // Validation
        if (!book_id) {
            return res.error('book_id là bắt buộc', 400);
        }

        // Check if book exists
        const book = await Book.findByPk(book_id);
        if (!book) {
            return res.error('Sách không tồn tại', 404);
        }

        // Check if wishlist entry exists
        const existingWishlist = await Wishlist.findOne({
            where: { user_id, book_id }
        });

        if (existingWishlist) {
            // Remove from wishlist
            await existingWishlist.destroy();
            return res.success(
                { action: 'removed', book_id: parseInt(book_id) }, 
                'Đã xóa khỏi danh sách yêu thích'
            );
        } else {
            // Add to wishlist
            await Wishlist.create({ user_id, book_id });
            return res.success(
                { action: 'added', book_id: parseInt(book_id) }, 
                'Đã thêm vào danh sách yêu thích'
            );
        }

    } catch (err) {
        console.error('toggleWishlist error:', err);
        res.error('Lỗi server', 500);
    }
};

// === GET WISHLIST ===
// Get all books in user's wishlist
const getWishlist = async (req, res) => {
    const user_id = req.user.user_id; // From auth middleware

    try {
        const wishlistItems = await Wishlist.findAll({
            where: { user_id },
            include: [{
                model: Book,
                attributes: ['book_id', 'title', 'price', 'cover_image', 'stock'],
                include: [
                    { 
                        model: Author, 
                        attributes: ['name'], 
                        through: { attributes: [] } 
                    }
                ]
            }],
            order: [['createdAt', 'DESC']] // Newest first
        });

        // Format results
        const result = wishlistItems.map(item => ({
            wishlist_id: item.wishlist_id,
            added_at: item.createdAt,
            book: {
                book_id: item.Book.book_id,
                title: item.Book.title,
                price: Number(item.Book.price),
                cover_image: item.Book.cover_image,
                stock: item.Book.stock,
                authors: item.Book.Authors?.map(a => a.name).join(', ') || ''
            }
        }));

        res.success(result, 'Lấy danh sách yêu thích thành công');

    } catch (err) {
        console.error('getWishlist error:', err);
        res.error('Lỗi server', 500);
    }
};

export default { toggleWishlist, getWishlist };
