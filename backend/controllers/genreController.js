// controllers/genreController.js
import Genre from '../models/Genre.js';
import Book from '../models/Book.js';

// === LẤY DANH SÁCH THỂ LOẠI ===
const getGenres = async (req, res) => {
    try {
        const genres = await Genre.findAll({
            order: [['name', 'ASC']] // Sắp xếp A-Z
        });
        res.success(genres, 'Lấy danh sách thể loại thành công');
    } catch (err) {
        console.error('Get genres error:', err);
        res.error('Lỗi server', 500);
    }
};

// === THÊM THỂ LOẠI (Admin) ===
const addGenre = async (req, res) => {
    const { name } = req.body;
    try {
        if (!name) {
            return res.error('Tên thể loại không được để trống', 400);
        }

        // Kiểm tra trùng tên
        const existingGenre = await Genre.findOne({ where: { name } });
        if (existingGenre) {
            return res.error('Thể loại này đã tồn tại', 400);
        }

        const newGenre = await Genre.create({ name });
        res.success(newGenre, 'Thêm thể loại thành công', 201);
    } catch (err) {
        console.error('Add genre error:', err);
        res.error('Lỗi server', 500);
    }
};

// === CẬP NHẬT THỂ LOẠI (Admin) ===
const updateGenre = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        if (!name) {
            return res.error('Tên thể loại không được để trống', 400);
        }

        const genre = await Genre.findByPk(id);
        if (!genre) {
            return res.error('Thể loại không tồn tại', 404);
        }

        // (Optional) Kiểm tra xem tên mới có bị trùng với thể loại khác không
        const duplicateCheck = await Genre.findOne({ where: { name } });
        if (duplicateCheck && duplicateCheck.genre_id !== parseInt(id)) {
            return res.error('Tên thể loại này đã được sử dụng', 400);
        }

        genre.name = name;
        await genre.save();

        res.success(genre, 'Cập nhật thể loại thành công');
    } catch (err) {
        console.error('Update genre error:', err);
        res.error('Lỗi server', 500);
    }
};

// === XÓA THỂ LOẠI (Admin) ===
const deleteGenre = async (req, res) => {
    const { id } = req.params;
    try {
        const genre = await Genre.findByPk(id);
        if (!genre) {
            return res.error('Thể loại không tồn tại', 404);
        }

        // --- KIỂM TRA RÀNG BUỘC ---
        // Không xóa thể loại nếu đang có sách thuộc thể loại này
        // Vì quan hệ N-N (BelongsToMany), Sequelize cung cấp hàm countBooks()
        const booksCount = await genre.countBooks();

        if (booksCount > 0) {
            return res.error(`Không thể xóa: Có ${booksCount} đầu sách đang thuộc thể loại này.`, 400);
        }

        await genre.destroy();
        res.success({ deleted_id: id }, 'Xóa thể loại thành công');
    } catch (err) {
        console.error('Delete genre error:', err);
        res.error('Lỗi server', 500);
    }
};

export default {
    getGenres,
    addGenre,
    updateGenre,
    deleteGenre
};