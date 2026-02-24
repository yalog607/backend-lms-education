import { verifyAccessToken } from '../utils/jwt.js';
import User from "../models/user.model.js";

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Token không được cung cấp' });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc hết hạn' });
    }

    req.role = decoded.role;
    req.userId = decoded.userId;
    next();
};

export const checkIsAdmin = async(req, res, next) => {
    const user = await User.findOne({_id: req.userId});
    if (!user) return res.status(401).json({message: "Không tìm thấy người dùng trên hệ thống"})

    if (user.role !== "admin") return res.status(403).json({message: "Bạn không có quyền thực hiện yêu cầu này"});

    next();
}

export const checkIsTeacher = async(req, res, next) => {
    const user = await User.findOne({_id: req.userId});
    if (!user) return res.status(401).json({message: "Không tìm thấy người dùng trên hệ thống"})

    if (user.role === "instructor" || user.role === "admin") {
        next();
    }
    else {
        return res.status(403).json({message: "Bạn không có quyền thực hiện yêu cầu này"});
    }
    
}