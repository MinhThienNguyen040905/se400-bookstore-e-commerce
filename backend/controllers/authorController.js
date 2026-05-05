// controllers/authorController.js
import Author from '../models/Author.js';
import Book from '../models/Book.js';

// === LẤY TẤT CẢ TÁC GIẢ (CÓ PHÂN TRANG) ===
const getAuthors = async (req, res) => {
    try {
        // 1. Lấy tham số từ Query String
        // Mặc định: trang 1, 20 tác giả/trang
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);
        const offset = (page - 1) * limit;

        // 2. Query DB dùng findAndCountAll
        const { count, rows } = await Author.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['name', 'ASC']] // Sắp xếp tên A-Z
        });

        // 3. Trả về kết quả kèm Metadata phân trang
        res.success({
            authors: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageSize: limit
            }
        }, 'Lấy danh sách tác giả thành công');

    } catch (err) {
        console.error('Get authors error:', err);
        res.error('Lỗi server', 500);
    }
};
// === THÊM TÁC GIẢ (Admin) ===
const addAuthor = async (req, res) => {
    const { name } = req.body;
    try {
        if (!name) {
            return res.error('Tên tác giả không được để trống', 400);
        }

        // Kiểm tra trùng tên (Optional - tùy logic bạn muốn)
        const existingAuthor = await Author.findOne({ where: { name } });
        if (existingAuthor) {
            return res.error('Tác giả này đã tồn tại', 400);
        }

        const newAuthor = await Author.create({ name });
        res.success(newAuthor, 'Thêm tác giả thành công', 201);
    } catch (err) {
        console.error('Add author error:', err);
        res.error('Lỗi server', 500);
    }
};

// === CẬP NHẬT TÁC GIẢ (Admin) ===
const updateAuthor = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        if (!name) {
            return res.error('Tên tác giả không được để trống', 400);
        }

        const author = await Author.findByPk(id);
        if (!author) {
            return res.error('Tác giả không tồn tại', 404);
        }

        author.name = name;
        await author.save();

        res.success(author, 'Cập nhật tác giả thành công');
    } catch (err) {
        console.error('Update author error:', err);
        res.error('Lỗi server', 500);
    }
};

// === XÓA TÁC GIẢ (Admin) ===
const deleteAuthor = async (req, res) => {
    const { id } = req.params;
    try {
        const author = await Author.findByPk(id);
        if (!author) {
            return res.error('Tác giả không tồn tại', 404);
        }

        // Kiểm tra xem tác giả này có sách nào không?
        // (Dù có cascade nhưng nên cảnh báo để tránh xóa nhầm dữ liệu quan trọng)
        const hasBooks = await author.countBooks();
        // countBooks là hàm tự động của Sequelize do quan hệ N-N

        if (hasBooks > 0) {
            return res.error(`Không thể xóa: Tác giả này đang có ${hasBooks} đầu sách trong hệ thống.`, 400);
        }

        await author.destroy();
        res.success({ deleted_id: id }, 'Xóa tác giả thành công');
    } catch (err) {
        console.error('Delete author error:', err);
        res.error('Lỗi server', 500);
    }
};

export default {
    getAuthors,
    addAuthor,
    updateAuthor,
    deleteAuthor
};