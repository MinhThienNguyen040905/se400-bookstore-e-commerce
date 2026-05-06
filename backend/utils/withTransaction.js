import sequelize from '../config/db.js';

const withTransaction = async (handler) => {
    const transaction = await sequelize.transaction();

    try {
        const result = await handler(transaction);
        await transaction.commit();
        return result;
    } catch (err) {
        if (!transaction.finished) await transaction.rollback();
        throw err;
    }
};

export default withTransaction;
