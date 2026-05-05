import catalogService from '../services/catalogService.js';

const getGenres = async (req, res) => {
    const result = await catalogService.getGenres();
    res.success(result, 'Lay danh sach the loai thanh cong');
};

const addGenre = async (req, res) => {
    const result = await catalogService.addGenre({ name: req.body.name });
    res.success(result, 'Them the loai thanh cong', 201);
};

const updateGenre = async (req, res) => {
    const result = await catalogService.updateGenre({
        id: req.params.id,
        name: req.body.name
    });

    res.success(result, 'Cap nhat the loai thanh cong');
};

const deleteGenre = async (req, res) => {
    const result = await catalogService.deleteGenre({ id: req.params.id });
    res.success(result, 'Xoa the loai thanh cong');
};

export default {
    getGenres,
    addGenre,
    updateGenre,
    deleteGenre
};
