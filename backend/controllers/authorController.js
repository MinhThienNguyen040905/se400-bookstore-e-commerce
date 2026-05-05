import catalogService from '../services/catalogService.js';

const getAuthors = async (req, res) => {
    const result = await catalogService.getAuthors({
        page: req.query.page,
        limit: req.query.limit
    });

    res.success(result, 'Lay danh sach tac gia thanh cong');
};

const addAuthor = async (req, res) => {
    const result = await catalogService.addAuthor({ name: req.body.name });
    res.success(result, 'Them tac gia thanh cong', 201);
};

const updateAuthor = async (req, res) => {
    const result = await catalogService.updateAuthor({
        id: req.params.id,
        name: req.body.name
    });

    res.success(result, 'Cap nhat tac gia thanh cong');
};

const deleteAuthor = async (req, res) => {
    const result = await catalogService.deleteAuthor({ id: req.params.id });
    res.success(result, 'Xoa tac gia thanh cong');
};

export default {
    getAuthors,
    addAuthor,
    updateAuthor,
    deleteAuthor
};
