import Enrollment from "../models/enrollment.model.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";

export const createEnrollment = async (req, res) => {
    try {
        const { course_id, pricePaid } = req.body;
        const user_id = req.userId;

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
            pricePaid
        });

        await User.findByIdAndUpdate(user_id, {
            $push: { enrolled_courses: course_id}
        })

        await Course.findByIdAndUpdate(course_id, {
            $inc: { studentCount: 1}
        })

        return res.status(201).json({
            success: true,
            message: "Đăng ký khóa học thành công!",
            data: newEnrollment
        });
    } catch (error) {
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
        const {userId} = req.params;

        const enrollments = await Enrollment.find({ userId })
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