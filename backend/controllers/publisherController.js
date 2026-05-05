import catalogService from '../services/catalogService.js';

const getPublishers = async (req, res) => {
    const result = await catalogService.getPublishers({
        page: req.query.page,
        limit: req.query.limit
    });

    res.success(result, 'Lay danh sach nha xuat ban thanh cong');
};

const addPublisher = async (req, res) => {
    const result = await catalogService.addPublisher({ name: req.body.name });
    res.success(result, 'Them nha xuat ban thanh cong', 201);
};

const updatePublisher = async (req, res) => {
    const result = await catalogService.updatePublisher({
        id: req.params.id,
        name: req.body.name
    });

    res.success(result, 'Cap nhat nha xuat ban thanh cong');
};

const deletePublisher = async (req, res) => {
    const result = await catalogService.deletePublisher({ id: req.params.id });
    res.success(result, 'Xoa nha xuat ban thanh cong');
};

export default {
    getPublishers,
    addPublisher,
    updatePublisher,
    deletePublisher
};
