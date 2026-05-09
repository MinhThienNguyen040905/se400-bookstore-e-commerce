import { parsePositiveInteger } from './common.js';

const parseLimit = (value) => {
    if (value == null || value === '') return 10;
    const limit = parsePositiveInteger(value, 'limit');
    return Math.min(limit, 20);
};

const list = (query) => ({
    limit: parseLimit(query.limit)
});

const similar = (params, query) => ({
    bookId: parsePositiveInteger(params.id, 'book_id'),
    limit: parseLimit(query.limit)
});

export default {
    list,
    similar
};
