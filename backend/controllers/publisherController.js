// controllers/publisherController.js
import Publisher from '../models/Publisher.js';
import Book from '../models/Book.js'; // Import để kiểm tra ràng buộc khi xóa

// === LẤY DANH SÁCH NXB (CÓ PHÂN TRANG) ===
const getPublishers = async (req, res) => {
    try {
        // 1. Lấy tham số từ Query String (URL)
        // Mặc định: trang 1, 20 NXB/trang
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);
        const offset = (page - 1) * limit;

        // 2. Query DB dùng findAndCountAll
        const { count, rows } = await Publisher.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [['name', 'ASC']] // Sắp xếp A-Z
        });

        // 3. Trả về kết quả kèm Metadata phân trang
        res.success({
            publishers: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                pageSize: limit
            }
        }, 'Lấy danh sách nhà xuất bản thành công');

    } catch (err) {
        console.error('Get publishers error:', err);
        res.error('Lỗi server', 500);
    }
};

// === THÊM NXB (Admin) ===
const addPublisher = async (req, res) => {
    const { name } = req.body;
    try {
        if (!name) {
            return res.error('Tên nhà xuất bản không được để trống', 400);
        }

        // Kiểm tra trùng tên
        const existingPublisher = await Publisher.findOne({ where: { name } });
        if (existingPublisher) {
            return res.error('Nhà xuất bản này đã tồn tại', 400);
        }

        const newPublisher = await Publisher.create({ name });
        res.success(newPublisher, 'Thêm nhà xuất bản thành công', 201);
    } catch (err) {
        console.error('Add publisher error:', err);
        res.error('Lỗi server', 500);
    }
};

// === CẬP NHẬT NXB (Admin) ===
const updatePublisher = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        if (!name) {
            return res.error('Tên nhà xuất bản không được để trống', 400);
        }

        const publisher = await Publisher.findByPk(id);
        if (!publisher) {
            return res.error('Nhà xuất bản không tồn tại', 404);
        }

        publisher.name = name;
        await publisher.save();

        res.success(publisher, 'Cập nhật nhà xuất bản thành công');
    } catch (err) {
        console.error('Update publisher error:', err);
        res.error('Lỗi server', 500);
    }
};

// === XÓA NXB (Admin) ===
const deletePublisher = async (req, res) => {
    const { id } = req.params;
    try {
        const publisher = await Publisher.findByPk(id);
        if (!publisher) {
            return res.error('Nhà xuất bản không tồn tại', 404);
        }

        // --- QUAN TRỌNG: KIỂM TRA RÀNG BUỘC ---
        // Không được xóa NXB nếu họ đang có sách bán trên hệ thống
        const booksCount = await publisher.countBooks();
        // Sequelize tự tạo hàm countBooks() do quan hệ hasMany khai báo trong associations.js

        if (booksCount > 0) {
            return res.error(`Không thể xóa: Nhà xuất bản này đang cung cấp ${booksCount} đầu sách.`, 400);
        }

        await publisher.destroy();
        res.success({ deleted_id: id }, 'Xóa nhà xuất bản thành công');
    } catch (err) {
        console.error('Delete publisher error:', err);
        res.error('Lỗi server', 500);
    }
};

export default {
    getPublishers,
    addPublisher,
    updatePublisher,
    deletePublisher
};