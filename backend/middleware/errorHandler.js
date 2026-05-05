const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.isOperational ? err.message : 'Loi server';

    if (!err.isOperational) {
        console.error(err);
    }

    res.status(status).json({ success: false, message });
};

export default errorHandler;
