import bookService from '../services/bookService.js';
import multer from 'multer';
import os from 'os';

const upload = multer({ dest: os.tmpdir() });
const uploadCover = upload.single('cover_image');

const addBook = async (req, res) => {
    const result = await bookService.addBook({
        bookData: req.body,
        coverFile: req.file
    });

    res.success(result, 'Them sach thanh cong', 201);
};

const getBooks = async (req, res) => {
    const result = await bookService.getBooks(req.query);
    const message = result.books.length ? 'Lay danh sach sach thanh cong' : 'Khong tim thay sach nao';

    res.success(result, message);
};

const getNewReleases = async (req, res) => {
    const result = await bookService.getNewReleases();
    res.success(result, 'Lay sach moi nhat thanh cong');
};

const getTopRatedBooks = async (req, res) => {
    const result = await bookService.getTopRatedBooks();
    res.success(result, 'Lay top sach thanh cong');
};

const getBookById = async (req, res) => {
    const result = await bookService.getBookById({
        bookId: req.params.id,
        userId: req.user?.user_id
    });

    res.success(result, 'Lay thong tin sach thanh cong');
};

const updateBook = async (req, res) => {
    const result = await bookService.updateBook({
        bookId: req.params.id,
        bookData: req.body,
        coverFile: req.file
    });

    res.success(result, 'Cap nhat sach thanh cong');
};

const deleteBook = async (req, res) => {
    await bookService.deleteBook({ bookId: req.params.id });
    res.success(null, 'Xoa sach thanh cong');
};

const getAllBooksSystem = async (req, res) => {
    const result = await bookService.getAllBooksSystem({
        page: req.query.page,
        limit: req.query.limit
    });

    res.success(result, 'Lay danh sach sach thanh cong');
};

export default {
    uploadCover,
    addBook,
    updateBook,
    deleteBook,
    getBooks,
    getNewReleases,
    getTopRatedBooks,
    getBookById,
    getAllBooksSystem
};
