import jwt from "jsonwebtoken";

export const generateToken = (id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" });
    return token;
}

export const generateRefreshToken = (id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" });
    return token;
}
