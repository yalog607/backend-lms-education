import Enrollment from "../models/enrollment.model.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";

export const createEnrollment = async (req, res) => {
    try {
        const { course_id } = req.body;
        const user_id = req.userId;

        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Khóa học không tồn tại" });
        }

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
        }

        if (user.balance < course.price) {
            return res.status(400).json({
                success: false,
                message: "Số dư không đủ để đăng ký khóa học này. Vui lòng nạp thêm tiền."
            });
        }

        const existingEnrollment = await Enrollment.findOne({ user_id, course_id });
        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: "Bạn đã đăng ký khóa học này rồi!"
            });
        }

        const newEnrollment = await Enrollment.create({
            user_id,
            course_id,
            pricePaid: course.price
        });

        await Promise.all([
            User.findByIdAndUpdate(user_id, {
                $push: { enrolled_courses: course_id },
                $inc: { balance: -course.price }
            }),
            Course.findByIdAndUpdate(course_id, {
                $inc: { studentCount: 1 }
            })
        ]);

        return res.status(201).json({
            success: true,
            message: "Đăng ký khóa học thành công!",
            data: newEnrollment
        });

    } catch (error) {
        console.error("Enrollment Error:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi thực hiện đăng ký",
            error: error.message
        });
    }
}

export const getEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({})
            .populate({
                path: 'course_id',
                select: 'title thumbnail description teacher_id'
            })
            .sort({ enrollmentDate: -1 });

        return res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Không thể lấy danh sách đăng ký", 
            error: error.message 
        });
    }
}

export const getEnrollmentsOfUser = async(req, res) => {
    try {
        const userId = req.userId;

        const enrollments = await Enrollment.find({ user_id: userId })
            .populate({
                path: 'course_id',
                select: '_id name teacher_id',
                populate: {
                    path: 'teacher_id',
                    select: 'first_name last_name email'
                }
            })
            .sort({ enrollmentDate: -1 });

        return res.status(200).json({
            success: true,
            count: enrollments.length,
            enrollments
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Không thể lấy danh sách đăng ký", 
            error: error.message 
        });
    }
}