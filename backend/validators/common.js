import AppError from '../errors/AppError.js';

const parsePositiveInteger = (value, fieldName) => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new AppError(`${fieldName} khong hop le`, 400);
    }

    return parsed;
};

const parseNonNegativeInteger = (value, fieldName) => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 0) {
        throw new AppError(`${fieldName} khong hop le`, 400);
    }

    return parsed;
};

const parseRequiredString = (value, fieldName) => {
    if (typeof value !== 'string' || !value.trim()) {
        throw new AppError(`${fieldName} khong hop le`, 400);
    }

    return value.trim();
};

const parseOptionalString = (value) => {
    if (value == null || value === '') return undefined;
    return String(value).trim();
};

export {
    parsePositiveInteger,
    parseNonNegativeInteger,
    parseRequiredString,
    parseOptionalString
};
