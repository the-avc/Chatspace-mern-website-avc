import jwt from "jsonwebtoken";

export const generateToken = (id) => {
    const token = jwt.sign({id}, process.env.JWT_SECRET_KEY, {expiresIn: process.env.ACCESS_TOKEN_EXPIRY||"15m"});
    return token;
}

export const generateRefreshToken = (id) => {
    const token = jwt.sign({id}, process.env.JWT_REFRESH_SECRET_KEY, {expiresIn: process.env.REFRESH_TOKEN_EXPIRY||"7d"});
    return token;
}