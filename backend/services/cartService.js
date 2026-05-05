import AppError from '../errors/AppError.js';
import CartItem from '../models/CartItem.js';
import Book from '../models/Book.js';
import Author from '../models/Author.js';

const parseQuantity = (quantity, { allowZero = false } = {}) => {
    const requestedQuantity = Number(quantity);
    const minQuantity = allowZero ? 0 : 1;

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < minQuantity) {
        throw new AppError('So luong khong hop le', 400);
    }

    return requestedQuantity;
};

const addToCart = async ({ userId, bookId, quantity = 1 }) => {
    const requestedQuantity = parseQuantity(quantity);

    const book = await Book.findByPk(bookId);
    if (!book) throw new AppError('Sach khong ton tai', 404);

    let cartItem = await CartItem.findOne({ where: { user_id: userId, book_id: bookId } });
    const newQuantity = (cartItem?.quantity || 0) + requestedQuantity;

    if (book.stock < newQuantity) {
        throw new AppError('So luong trong kho khong du', 400);
    }

    if (cartItem) {
        cartItem.quantity = newQuantity;
        await cartItem.save();
    } else {
        cartItem = await CartItem.create({
            user_id: userId,
            book_id: bookId,
            quantity: requestedQuantity
        });
    }

    await cartItem.reload({
        include: [{ model: Book, attributes: ['title', 'price', 'cover_image'] }]
    });

    return cartItem;
};

const updateCart = async ({ userId, bookId, quantity }) => {
    const requestedQuantity = parseQuantity(quantity, { allowZero: true });

    const cartItem = await CartItem.findOne({ where: { user_id: userId, book_id: bookId } });
    if (!cartItem) throw new AppError('Khong tim thay san pham trong gio hang', 404);

    const book = await Book.findByPk(bookId);
    if (!book) throw new AppError('Sach khong ton tai', 404);

    if (requestedQuantity > book.stock) {
        throw new AppError('So luong vuot qua ton kho', 400);
    }

    if (requestedQuantity === 0) {
        await cartItem.destroy();
    } else {
        cartItem.quantity = requestedQuantity;
        await cartItem.save();
    }

    return getCart({ userId });
};

const removeFromCart = async ({ userId, bookId }) => {
    const cartItem = await CartItem.findOne({ where: { user_id: userId, book_id: bookId } });
    if (!cartItem) throw new AppError('Khong tim thay san pham trong gio hang', 404);

    await cartItem.destroy();

    return getCart({ userId });
};

const getCart = async ({ userId }) => {
    const cartItems = await CartItem.findAll({
        where: { user_id: userId },
        include: [
            {
                model: Book,
                attributes: ['book_id', 'title', 'price', 'cover_image', 'stock'],
                include: [
                    {
                        model: Author,
                        attributes: ['name'],
                        through: { attributes: [] }
                    }
                ]
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    const total = cartItems.reduce((sum, item) => sum + item.quantity * Number(item.Book.price), 0);

    return {
        items: cartItems.map(item => ({
            cart_item_id: item.cart_item_id,
            book_id: item.book_id,
            title: item.Book.title,
            cover_image: item.Book.cover_image,
            price: Number(item.Book.price),
            stock: item.Book.stock,
            quantity: item.quantity,
            authors: item.Book.Authors?.map(a => a.name).join(', ') || 'Khong ro tac gia'
        })),
        total_items: cartItems.length,
        total_price: Number(total)
    };
};

export default { addToCart, updateCart, removeFromCart, getCart };
