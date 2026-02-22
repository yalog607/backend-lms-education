import Enrollment from "../models/enrollment.model.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";

export const createEnrollment = async (req, res) => {
    try {
        const { course_id } = req.body;
        const user_id = req.userId;

        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course does not exist" });
        }

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User does not exist" });
        }

        if (user.balance < course.price) {
            return res.status(400).json({
                success: false,
                message: "Your balance is insufficient to enroll in this course. Please top up your account."
            });
        }

        const existingEnrollment = await Enrollment.findOne({ user_id, course_id });
        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: "You are already enrolled in this course."
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
            message: "Enrollment successful! The course fee has been deducted from your account.",
            data: newEnrollment
        });

    } catch (error) {
        console.error("Enrollment Error:", error);
        res.status(500).json({
            success: false,
            message: "Error while enrolling",
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

    export const getEnrollmentsOfUser = async (req, res) => {
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