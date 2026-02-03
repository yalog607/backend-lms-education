import jwt from 'jsonwebtoken';
import 'dotenv/config';

const ACCESS_TOKEN_EXPIRY = process.env.NODE_ENV === 'production' ? '15m' : '7d';
const REFRESH_TOKEN_EXPIRY = '7d';

export const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret',
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret',
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
};

export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET || 'your_access_token_secret'
        );
    } catch (error) {
        return null;
    }
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret'
        );
    } catch (error) {
        return null;
    }
};
