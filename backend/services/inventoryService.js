import AppError from '../errors/AppError.js';
import Book from '../models/Book.js';

const getItemBookId = (item) => item.book_id ?? item.Book?.book_id;

const validateCartItemsInStock = async ({ cartItems, transaction, lock = false }) => {
    const booksById = new Map();

    for (const item of cartItems) {
        const bookId = getItemBookId(item);
        const queryOptions = { transaction };

        if (lock) {
            queryOptions.lock = transaction.LOCK.UPDATE;
        }

        const book = await Book.findByPk(bookId, queryOptions);

        if (!book || book.stock < item.quantity) {
            throw new AppError(`Het hang: ${book?.title || bookId}`, 400);
        }

        booksById.set(bookId, book);
    }

    return booksById;
};

const decreaseStockForCartItems = async ({ cartItems, transaction }) => {
    for (const item of cartItems) {
        await Book.decrement('stock', {
            by: item.quantity,
            where: { book_id: item.book_id },
            transaction
        });
    }
};

const restoreStockForOrderItems = async ({ orderItems, transaction }) => {
    for (const item of orderItems) {
        await Book.increment('stock', {
            by: item.quantity,
            where: { book_id: item.book_id },
            transaction
        });
    }
};

export {
    validateCartItemsInStock,
    decreaseStockForCartItems,
    restoreStockForOrderItems
};
