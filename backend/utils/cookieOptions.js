const isProduction = process.env.NODE_ENV === 'production';

export const refreshCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
};
