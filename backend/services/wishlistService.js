import AppError from '../errors/AppError.js';
import Wishlist from '../models/Wishlist.js';
import Book from '../models/Book.js';
import Author from '../models/Author.js';

const toggleWishlist = async ({ userId, bookId }) => {
    if (!bookId) {
        throw new AppError('book_id la bat buoc', 400);
    }

    const book = await Book.findByPk(bookId);
    if (!book) {
        throw new AppError('Sach khong ton tai', 404);
    }

    const existingWishlist = await Wishlist.findOne({
        where: { user_id: userId, book_id: bookId }
    });

    if (existingWishlist) {
        await existingWishlist.destroy();
        return {
            action: 'removed',
            book_id: parseInt(bookId)
        };
    }

    await Wishlist.create({ user_id: userId, book_id: bookId });
    return {
        action: 'added',
        book_id: parseInt(bookId)
    };
};

const getWishlist = async ({ userId }) => {
    const wishlistItems = await Wishlist.findAll({
        where: { user_id: userId },
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
        order: [['createdAt', 'DESC']]
    });

    return wishlistItems.map((item) => ({
        wishlist_id: item.wishlist_id,
        added_at: item.createdAt,
        book: {
            book_id: item.Book.book_id,
            title: item.Book.title,
            price: Number(item.Book.price),
            cover_image: item.Book.cover_image,
            stock: item.Book.stock,
            authors: item.Book.Authors?.map((author) => author.name).join(', ') || ''
        }
    }));
};

export default { toggleWishlist, getWishlist };
