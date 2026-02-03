import Notification from "../models/notification.model.js";

export const createNotification = async (req, res) => {
    try {
        const { user_id, message } = req.body;

        if (!user_id || !message) {
            return res.status(400).json({ success: false, message: "Thiếu user_id hoặc nội dung thông báo" });
        }

        const notification = await Notification.create({
            user_id,
            message
        });

        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi tạo thông báo", error: error.message });
    }
};

export const readNotification = async (req, res) => {
    try {
        const { id } = req.params;
        
        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thông báo" });
        }

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi cập nhật trạng thái đã đọc" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        const deletedNotification = await Notification.findByIdAndDelete(notificationId);

        if (!deletedNotification) {
            return res.status(404).json({ success: false, message: "Thông báo không tồn tại" });
        }

        res.status(200).json({ success: true, message: "Đã xóa thông báo thành công" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi khi xóa thông báo" });
    }
};

export const getNotificationOfUser = async (req, res) => {
    try {
        const user_id = req.userId;

        const notifications = await Notification.find({ user_id })
            .sort({ createdAt: -1 })
            .limit(50); 

        res.status(200).json({ 
            success: true, 
            count: notifications.length,
            unreadCount: notifications.filter(n => !n.isRead).length, 
            data: notifications 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Không thể lấy danh sách thông báo" });
    }
};