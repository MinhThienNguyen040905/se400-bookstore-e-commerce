// controllers/cartController.js
import CartItem from '../models/CartItem.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Author from '../models/Author.js';

// === THÊM SÁCH VÀO GIỎ HÀNG ===
const addToCart = async (req, res) => {
    const { book_id, quantity = 1 } = req.body;
    const userId = req.user.user_id;

    try {
        // Kiểm tra sách tồn tại
        const book = await Book.findByPk(book_id);
        if (!book) return res.error('Sách không tồn tại', 404);

        // Kiểm tra số lượng tồn kho
        if (book.stock < quantity) return res.error('Số lượng trong kho không đủ', 400);

        // Tìm hoặc tạo cart item
        let cartItem = await CartItem.findOne({ where: { user_id: userId, book_id } });

        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({ user_id: userId, book_id, quantity });
        }

        // Load lại book info để trả về
        await cartItem.reload({ include: [{ model: Book, attributes: ['title', 'price', 'cover_image'] }] });

        res.success(cartItem, 'Thêm vào giỏ hàng thành công', 201);
    } catch (err) {
        console.error('Lỗi thêm vào giỏ:', err);
        res.error('Lỗi server', 500);
    }
};

import cartController from '../controllers/cartController.js'; // Nếu cần gọi lại getCart

// ... các hàm khác giữ nguyên

// === CẬP NHẬT SỐ LƯỢNG ===
const updateCart = async (req, res) => {
    const { book_id, quantity } = req.body;
    const userId = req.user.user_id;

    if (!quantity || quantity < 0) return res.error('Số lượng không hợp lệ', 400);

    try {
        const cartItem = await CartItem.findOne({ where: { user_id: userId, book_id } });
        if (!cartItem) return res.error('Không tìm thấy sản phẩm trong giỏ hàng', 404);

        const book = await Book.findByPk(book_id);
        if (!book) return res.error('Sách không tồn tại', 404);

        if (quantity > book.stock) return res.error('Số lượng vượt quá tồn kho', 400);

        if (quantity === 0) {
            await cartItem.destroy();
        } else {
            cartItem.quantity = quantity;
            await cartItem.save();
        }

        // DÙNG LUÔN getCart() ĐỂ TRẢ VỀ FULL CART SAU KHI CẬP NHẬT
        return getCart(req, res); // <-- Quan trọng: gọi lại getCart
    } catch (err) {
        console.error('Lỗi cập nhật giỏ hàng:', err);
        res.error('Lỗi server', 500);
    }
};

// === XÓA SẢN PHẨM ===
const removeFromCart = async (req, res) => {
    const { book_id } = req.params;
    const userId = req.user.user_id;

    try {
        const cartItem = await CartItem.findOne({ where: { user_id: userId, book_id } });
        if (!cartItem) return res.error('Không tìm thấy sản phẩm trong giỏ hàng', 404);

        await cartItem.destroy();

        // DÙNG LUÔN getCart() ĐỂ TRẢ VỀ GIỎ HÀNG MỚI
        return getCart(req, res); // <-- Gọi lại getCart
    } catch (err) {
        console.error('Lỗi xóa giỏ hàng:', err);
        res.error('Lỗi server', 500);
    }
};

// === LẤY GIỎ HÀNG ===
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

        // Tính tổng tiền
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
                authors: item.Book.Authors?.map(a => a.name).join(', ') || 'Không rõ tác giả' // ← THÊM TRƯỜNG NÀY
            })),
            total_items: cartItems.length,
            total_price: Number(total)
        };

        res.success(result, 'Lấy giỏ hàng thành công');
    } catch (err) {
        console.error('Lỗi lấy giỏ hàng:', err);
        res.error('Lỗi server', 500);
    }
};

export default { addToCart, updateCart, removeFromCart, getCart };