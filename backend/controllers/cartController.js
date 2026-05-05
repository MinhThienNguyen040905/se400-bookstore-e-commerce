// controllers/cartController.js
import cartService from '../services/cartService.js';

const addToCart = async (req, res) => {
    const cartItem = await cartService.addToCart({
        userId: req.user.user_id,
        bookId: req.body.book_id,
        quantity: req.body.quantity
    });

    res.success(cartItem, 'Them vao gio hang thanh cong', 201);
};

const updateCart = async (req, res) => {
    const cart = await cartService.updateCart({
        userId: req.user.user_id,
        bookId: req.body.book_id,
        quantity: req.body.quantity
    });

    res.success(cart, 'Lay gio hang thanh cong');
};

const removeFromCart = async (req, res) => {
    const cart = await cartService.removeFromCart({
        userId: req.user.user_id,
        bookId: req.params.book_id
    });

    res.success(cart, 'Lay gio hang thanh cong');
};

const getCart = async (req, res) => {
    const cart = await cartService.getCart({ userId: req.user.user_id });

    res.success(cart, 'Lay gio hang thanh cong');
};

export default { addToCart, updateCart, removeFromCart, getCart };
