import Notification from "../models/notification.model.js";
import Enrollment from "../models/enrollment.model.js";
import Course from "../models/course.model.js";
import mongoose from "mongoose";

export const createNotification = async (req, res) => {
    try {
        const { course_id, user_id, title, message, type = "course", link = "", meta = {} } = req.body;
        const senderId = req.userId;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: "Thiếu tiêu đề hoặc nội dung thông báo" });
        }

        if (course_id) {
            if (!mongoose.Types.ObjectId.isValid(course_id)) {
                return res.status(400).json({ success: false, message: "course_id is not valid" });
            }

            const course = await Course.findById(course_id).select("_id teacher_id");
            if (!course) {
                return res.status(404).json({ success: false, message: "No course found" });
            }

            if (
                req.role !== "admin" &&
                course.teacher_id &&
                course.teacher_id.toString() !== senderId
            ) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to send notifications for this course"
                });
            }

            const enrollments = await Enrollment.find({ course_id }).select("user_id -_id").lean();
            const recipientIds = [...new Set(enrollments.map((item) => item.user_id.toString()))];

            if (recipientIds.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No students enrolled in the course"
                });
            }

            const documents = recipientIds.map((studentId) => ({
                user_id: studentId,
                courseId: course_id,
                title,
                message,
                type,
                link,
                meta
            }));

            const notifications = await Notification.insertMany(documents, { ordered: false });

            return res.status(201).json({
                success: true,
                message: "Đã gửi thông báo cho học viên trong khóa học",
                count: notifications.length,
                data: notifications
            });
        }

        if (!user_id) {
            return res.status(400).json({ success: false, message: "Missing user_id or course_id" });
        }

        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({ success: false, message: "user_id is not valid" });
        }

        const notification = await Notification.create({
            user_id,
            title,
            message,
            type,
            link,
            meta
        });

        return res.status(201).json({ success: true, data: notification });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi khi tạo thông báo", error: error.message });
    }
};

export const readNotification = async (req, res) => {
    try {
        const id = req.params.id || req.body.notificationId || req.body.id;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "notificationId không hợp lệ" });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: id, user_id: req.userId },
            { isRead: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thông báo hoặc bạn không có quyền" });
        }

        return res.status(200).json({ success: true, data: notification });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi khi cập nhật trạng thái đã đọc" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;

        if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ success: false, message: "notificationId không hợp lệ" });
        }

        const deletedNotification = await Notification.findOneAndDelete({
            _id: notificationId,
            user_id: req.userId
        });
        
        if (!deletedNotification) {
            return res.status(404).json({ success: false, message: "Thông báo không tồn tại hoặc bạn không có quyền" });
        }

        return res.status(200).json({ success: true, message: "Đã xóa thông báo thành công" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi khi xóa thông báo" });
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