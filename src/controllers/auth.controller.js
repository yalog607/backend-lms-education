import bcrypt from 'bcrypt';
import RefreshToken from '../models/refreshToken.model.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import User from "../models/user.model.js";

export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Hàm đăng ký
export const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone, role } = req.body;
        if (!isValidEmail(email)) {
            return res.status(400).json({
                message: 'Định dạng email không hợp lệ'
            })
        }

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ thông tin.'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email đã được đăng ký' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const newUser = new User({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            phone: phone || '0xxxxxxxxx',
            role: role || 'student'
        });

        await newUser.save();

        // Tạo tokens
        const accessToken = generateAccessToken(newUser._id);
        const refreshToken = generateRefreshToken(newUser._id);

        const newRefreshToken = await RefreshToken.findOneAndUpdate(
            { user_id: newUser._id },
            {
                user_id: newUser._id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        res.cookie('refreshToken', newRefreshToken.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            user: {
                user_id: newUser._id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                role: newUser.role
            },
            accessToken
        });

    } catch (error) {
        console.error('Lỗi đăng ký:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Hàm đăng nhập
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra dữ liệu bắt buộc
        if (!email || !password) {
            return res.status(400).json({
                message: 'Vui lòng cung cấp email và password'
            });
        }

        // Tìm user theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email không tồn tại' });
        }

        // Kiểm tra password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác' });
        }

        // Tạo tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        const newRefreshToken = await RefreshToken.findOneAndUpdate(
            { user_id: user._id },
            {
                user_id: user._id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 ngày
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        res.cookie('refreshToken', newRefreshToken.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            user: {
                user_id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            },
            accessToken,
        });

    } catch (error) {
        console.error('Lỗi đăng nhập:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

// Hàm làm mới access token
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Bạn chưa đăng nhập" })
        }

        const user_id = req.userId;
        if (!user_id) {
            return res.status(400).json({ message: `refresh_token của ${user_id} không tồn tại` });
        }

        const storedToken = await RefreshToken.findOne({ user_id, token: refreshToken });
        if (!storedToken) {
            await RefreshToken.deleteMany({ user_id });
            return res.status(403).json({ message: "Refresh token không tồn tại" })
        }
        // Kiểm tra refresh token
        const decoded = verifyRefreshToken(storedToken.token);
        if (!decoded) {
            return res.status(403).json({ message: 'Refresh token không hợp lệ hoặc hết hạn' });
        }

        // Tạo access token mới
        const newAccessToken = generateAccessToken(decoded.userId);
        const newRefreshToken = generateRefreshToken(decoded.userId);

        storedToken.token = newRefreshToken;
        await storedToken.save();

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: 'Tạo access token mới thành công',
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error('Lỗi làm mới token:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const user_id = req.userId;
        await RefreshToken.deleteMany({ user_id });
        return res.status(200).json({
            success: true, message: 'Đăng xuất thành công'
        });
    } catch (error) {
        console.error('Lỗi đăng xuất:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body;
        await User.findByIdAndDelete(userId)

        return res.status(200).json({ success: true, message: "Xóa người dùng thành công" })
    } catch (error) {
        console.error('Lỗi xóa user:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { first_name, last_name, phone } = req.body;
        if (!first_name && !last_name && !phone) {
            return res.status(400).json({
                success: false,
                message: "Không có thông tin mới để cập nhật"
            });
        }

        let updateInformation = {}
        if (first_name) updateInformation.first_name = first_name;
        if (last_name) updateInformation.last_name = last_name;
        if (phone) updateInformation.phone = phone;

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { first_name, last_name, phone },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật thông tin thành công!",
            data: updatedUser
        });
    } catch (error) {
        console.error("Lỗi updatePhoneUser:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi cập nhật thông tin."
        });
    }
}

export const updateAvatarUser = async (req, res) => {
    try {
        if (!req.file) return res.status(401).json({ success: false, message: "Không tìm thấy đường dẫn của ảnh" })
        const imageUrl = req.file.path;
        const updatedUser = await User.findByIdAndUpdate(req.userId, {
            avatar: imageUrl
        }, {
            new: true,
        }).select('-password');

        if (!updatedUser) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });

        return res.status(200).json({ success: true, message: "Cập nhật ảnh đại diện thành công", data: updatedUser })
    } catch (error) {

    }
}

export const getAllUser = async (req, res) => {
    try {
        const users = await User.find({});

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin người dùng thành công",
            data: users
        })
    } catch (error) {
        console.error("Lỗi lấy thông tin người dùng: ", error);
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const changePassword = async (req, res) => {
    try {
        const userId = req.userId;
        const { password, confirmPassword, newPassword } = req.body;

        if (password !== confirmPassword)
            return res.status(401).json({ success: false, message: "Mật khẩu nhập lại không chính xác!" });
        
        const user = await User.findById(userId);
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Mật khẩu cũ không chính xác' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json(
            {
                success: true,
                message: 'Đổi mật khẩu thành công!'
            }
        )
    } catch (error) {
        console.error("Lỗi thay đổi mật khẩu: ", error);
        return res.status(500).json({ message: error.message })
    }
} 

export const getMe = async(req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select('-password');
        return res.status(200).json({success: true, user: user});
    } catch (error) {
        console.error("Loi isMe: ", error);
        return res.status(500).json({success: false, message: error.message})
    }
}