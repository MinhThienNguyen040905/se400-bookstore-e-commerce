// controllers/cartController.js
import cartService from '../services/cartService.js';
import cartValidator from '../validators/cartValidator.js';

const addToCart = async (req, res) => {
    const input = cartValidator.addToCart(req.body);
    const cartItem = await cartService.addToCart({
        userId: req.user.user_id,
        bookId: input.bookId,
        quantity: input.quantity
    });

    res.success(cartItem, 'Them vao gio hang thanh cong', 201);
};

const updateCart = async (req, res) => {
    const input = cartValidator.updateCart(req.body);
    const cart = await cartService.updateCart({
        userId: req.user.user_id,
        bookId: input.bookId,
        quantity: input.quantity
    });

    res.success(cart, 'Lay gio hang thanh cong');
};

const removeFromCart = async (req, res) => {
    const input = cartValidator.removeFromCart(req.params);
    const cart = await cartService.removeFromCart({
        userId: req.user.user_id,
        bookId: input.bookId
    });

    res.success(cart, 'Lay gio hang thanh cong');
};

const getCart = async (req, res) => {
    const cart = await cartService.getCart({ userId: req.user.user_id });

    res.success(cart, 'Lay gio hang thanh cong');
};

export default { addToCart, updateCart, removeFromCart, getCart };
