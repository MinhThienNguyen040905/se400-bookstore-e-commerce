// middleware/response.js
const response = (req, res, next) => {
    res.success = (data = {}, message = 'Thành công', status = 200) => {
        res.status(status).json({ success: true, message, data });
    };

    res.error = (message = 'Lỗi server', status = 500) => {
        res.status(status).json({ success: false, message });
    };

    next();
};

export default response;