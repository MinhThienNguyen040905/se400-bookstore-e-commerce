// controllers/cartController.js
import CartItem from '../models/CartItem.js';
import Book from '../models/Book.js';
import Author from '../models/Author.js';

const addToCart = async (req, res) => {
    const { book_id, quantity = 1 } = req.body;
    const userId = req.user.user_id;
    const requestedQuantity = Number(quantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) {
        return res.error('So luong khong hop le', 400);
    }

    try {
        const book = await Book.findByPk(book_id);
        if (!book) return res.error('Sach khong ton tai', 404);

        let cartItem = await CartItem.findOne({ where: { user_id: userId, book_id } });
        const newQuantity = (cartItem?.quantity || 0) + requestedQuantity;

        if (book.stock < newQuantity) return res.error('So luong trong kho khong du', 400);

        if (cartItem) {
            cartItem.quantity = newQuantity;
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({ user_id: userId, book_id, quantity: requestedQuantity });
        }

        await cartItem.reload({ include: [{ model: Book, attributes: ['title', 'price', 'cover_image'] }] });

        res.success(cartItem, 'Them vao gio hang thanh cong', 201);
    } catch (err) {
        console.error('Loi them vao gio:', err);
        res.error('Loi server', 500);
    }
};

const updateCart = async (req, res) => {
    const { book_id, quantity } = req.body;
    const userId = req.user.user_id;
    const requestedQuantity = Number(quantity);

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 0) {
        return res.error('So luong khong hop le', 400);
    }

    try {
        const cartItem = await CartItem.findOne({ where: { user_id: userId, book_id } });
        if (!cartItem) return res.error('Khong tim thay san pham trong gio hang', 404);

        const book = await Book.findByPk(book_id);
        if (!book) return res.error('Sach khong ton tai', 404);

        if (requestedQuantity > book.stock) return res.error('So luong vuot qua ton kho', 400);

        if (requestedQuantity === 0) {
            await cartItem.destroy();
        } else {
            cartItem.quantity = requestedQuantity;
            await cartItem.save();
        }

        return getCart(req, res);
    } catch (err) {
        console.error('Loi cap nhat gio hang:', err);
        res.error('Loi server', 500);
    }
};

const removeFromCart = async (req, res) => {
    const { book_id } = req.params;
    const userId = req.user.user_id;

    try {
        const cartItem = await CartItem.findOne({ where: { user_id: userId, book_id } });
        if (!cartItem) return res.error('Khong tim thay san pham trong gio hang', 404);

        await cartItem.destroy();

        return getCart(req, res);
    } catch (err) {
        console.error('Loi xoa gio hang:', err);
        res.error('Loi server', 500);
    }
};

const getCart = async (req, res) => {
    const userId = req.user.user_id;

    try {
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

        const result = {
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

        res.success(result, 'Lay gio hang thanh cong');
    } catch (err) {
        console.error('Loi lay gio hang:', err);
        res.error('Loi server', 500);
    }
};

export default { addToCart, updateCart, removeFromCart, getCart };
