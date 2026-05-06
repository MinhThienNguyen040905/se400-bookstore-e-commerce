import {
    parseNonNegativeInteger,
    parsePositiveInteger
} from './common.js';

const addToCart = (body) => ({
    bookId: parsePositiveInteger(body.book_id, 'book_id'),
    quantity: body.quantity == null
        ? 1
        : parsePositiveInteger(body.quantity, 'quantity')
});

const updateCart = (body) => ({
    bookId: parsePositiveInteger(body.book_id, 'book_id'),
    quantity: parseNonNegativeInteger(body.quantity, 'quantity')
});

const removeFromCart = (params) => ({
    bookId: parsePositiveInteger(params.book_id, 'book_id')
});

export default {
    addToCart,
    updateCart,
    removeFromCart
};
