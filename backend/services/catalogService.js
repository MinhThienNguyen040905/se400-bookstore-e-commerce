import AppError from '../errors/AppError.js';
import Author from '../models/Author.js';
import Publisher from '../models/Publisher.js';
import Genre from '../models/Genre.js';

const buildPagination = ({ count, page, limit, key, rows }) => ({
    [key]: rows,
    pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        pageSize: limit
    }
});

const getAuthors = async ({ page, limit }) => {
    const currentPage = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.max(parseInt(limit) || 20, 1);
    const offset = (currentPage - 1) * pageSize;

    const { count, rows } = await Author.findAndCountAll({
        limit: pageSize,
        offset,
        order: [['name', 'ASC']]
    });

    return buildPagination({ count, page: currentPage, limit: pageSize, key: 'authors', rows });
};

const addAuthor = async ({ name }) => {
    if (!name) throw new AppError('Ten tac gia khong duoc de trong', 400);

    const existingAuthor = await Author.findOne({ where: { name } });
    if (existingAuthor) throw new AppError('Tac gia nay da ton tai', 400);

    return Author.create({ name });
};

const updateAuthor = async ({ id, name }) => {
    if (!name) throw new AppError('Ten tac gia khong duoc de trong', 400);

    const author = await Author.findByPk(id);
    if (!author) throw new AppError('Tac gia khong ton tai', 404);

    author.name = name;
    await author.save();
    return author;
};

const deleteAuthor = async ({ id }) => {
    const author = await Author.findByPk(id);
    if (!author) throw new AppError('Tac gia khong ton tai', 404);

    const hasBooks = await author.countBooks();
    if (hasBooks > 0) {
        throw new AppError(`Khong the xoa: Tac gia nay dang co ${hasBooks} dau sach trong he thong.`, 400);
    }

    await author.destroy();
    return { deleted_id: id };
};

const getPublishers = async ({ page, limit }) => {
    const currentPage = Math.max(parseInt(page) || 1, 1);
    const pageSize = Math.max(parseInt(limit) || 20, 1);
    const offset = (currentPage - 1) * pageSize;

    const { count, rows } = await Publisher.findAndCountAll({
        limit: pageSize,
        offset,
        order: [['name', 'ASC']]
    });

    return buildPagination({ count, page: currentPage, limit: pageSize, key: 'publishers', rows });
};

const addPublisher = async ({ name }) => {
    if (!name) throw new AppError('Ten nha xuat ban khong duoc de trong', 400);

    const existingPublisher = await Publisher.findOne({ where: { name } });
    if (existingPublisher) throw new AppError('Nha xuat ban nay da ton tai', 400);

    return Publisher.create({ name });
};

const updatePublisher = async ({ id, name }) => {
    if (!name) throw new AppError('Ten nha xuat ban khong duoc de trong', 400);

    const publisher = await Publisher.findByPk(id);
    if (!publisher) throw new AppError('Nha xuat ban khong ton tai', 404);

    publisher.name = name;
    await publisher.save();
    return publisher;
};

const deletePublisher = async ({ id }) => {
    const publisher = await Publisher.findByPk(id);
    if (!publisher) throw new AppError('Nha xuat ban khong ton tai', 404);

    const booksCount = await publisher.countBooks();
    if (booksCount > 0) {
        throw new AppError(`Khong the xoa: Nha xuat ban nay dang cung cap ${booksCount} dau sach.`, 400);
    }

    await publisher.destroy();
    return { deleted_id: id };
};

const getGenres = async () => Genre.findAll({ order: [['name', 'ASC']] });

const addGenre = async ({ name }) => {
    if (!name) throw new AppError('Ten the loai khong duoc de trong', 400);

    const existingGenre = await Genre.findOne({ where: { name } });
    if (existingGenre) throw new AppError('The loai nay da ton tai', 400);

    return Genre.create({ name });
};

const updateGenre = async ({ id, name }) => {
    if (!name) throw new AppError('Ten the loai khong duoc de trong', 400);

    const genre = await Genre.findByPk(id);
    if (!genre) throw new AppError('The loai khong ton tai', 404);

    const duplicateCheck = await Genre.findOne({ where: { name } });
    if (duplicateCheck && duplicateCheck.genre_id !== parseInt(id)) {
        throw new AppError('Ten the loai nay da duoc su dung', 400);
    }

    genre.name = name;
    await genre.save();
    return genre;
};

const deleteGenre = async ({ id }) => {
    const genre = await Genre.findByPk(id);
    if (!genre) throw new AppError('The loai khong ton tai', 404);

    const booksCount = await genre.countBooks();
    if (booksCount > 0) {
        throw new AppError(`Khong the xoa: Co ${booksCount} dau sach dang thuoc the loai nay.`, 400);
    }

    await genre.destroy();
    return { deleted_id: id };
};

export default {
    getAuthors,
    addAuthor,
    updateAuthor,
    deleteAuthor,
    getPublishers,
    addPublisher,
    updatePublisher,
    deletePublisher,
    getGenres,
    addGenre,
    updateGenre,
    deleteGenre
};
