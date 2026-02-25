import Course from "../models/course.model.js"
import Section from "../models/section.model.js"
import Lesson from "../models/lesson.model.js"
import User from "../models/user.model.js"
import Enrollment from "../models/enrollment.model.js";

const formatDuration = (totalSeconds) => {
    if (!totalSeconds) return "0 second";
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let mStr = minutes > 0 ? "minutes" : "minute";
    let sStr = seconds > 0 ? "seconds" : "second";

    if (minutes > 0) {
        return `${minutes} ${mStr} ${seconds} ${sStr}`;
    }
    return `${seconds} ${sStr}`;
};

export const getLatestCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('teacher_id', 'first_name last_name email')

        return res.status(200).json({
            message: "Lấy danh sách 5 khóa học mới nhất thành công",
            courses
        })
    } catch (error) {
        console.error("Lỗi database Courses: ", error)
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
}

export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('teacher_id', 'first_name last_name email')

        return res.status(200).json({
            message: "Lấy toàn bộ danh sách khóa học thành công",
            courses
        })
    } catch (error) {
        console.error("Lỗi database Courses: ", error)
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
}

export const checkOwnCourse = async (req, res) => {
    try {
        const { course_id } = req.params;
        const user_id = req.userId;
        if (!user_id || !course_id) {
            return res.status(400).json({ success: false, message: "Thiếu thông tin cần thiết" });
        }
        const enrollment = await Enrollment.findOne({ user_id, course_id });
        if (enrollment) {
            return res.status(200).json({
                success: true,
                message: "You are enrolled in this course",
                isEnrolled: true
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "You are not enrolled in this course",
                isEnrolled: false
            });
        }
    } catch (err) {
        console.error("Error checking enrollment:", err);
        return res.status(500).json({
            success: false,
            message: "Error while checking enrollment",
            error: err.message
        });
    }
}

export const createCourse = async (req, res) => {
    try {
        const { name, description, price, thumbnail, teacher_id, level } = req.body;

        const imageUrl = req.file?.path;

        if (!name || !description || !price) {
            return res.status(400).json({
                message: 'Thiếu các trường quan trọng: name, description, price'
            })
        }

        const newCourse = new Course({
            name,
            description,
            price,
            thumbnail,
            teacher_id: teacher_id || null,
            level: level || 'beginner',
            thumbnail: imageUrl || ''
        })
        await newCourse.save();

        return res.status(201).json({
            message: "Tạo khóa học thành công",
            course: newCourse
        })
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Dữ liệu không hợp lệ", error: error.message });
        }
        console.error('Lỗi trong quá trình tạo khóa học: ', error);
        return res.status(500).json({ message: "Lỗi server" });
    }
}

export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id).lean();
        if (!course) {
            return res.status(404).json({ message: "This course doesn't exist!" });
        }

        const sections = await Section.find({ course_id: id, isPublished: true }).sort({ orderIndex: 1 }).lean();
        const sectionIds = sections.map(section => section._id);

        const lessons = await Lesson.find({ section_id: { $in: sectionIds }, isPublished: true })
            .sort({ order: 1 })
            .lean();

        const sectionsWithLessons = sections.map(section => {
            const sectionLessons = lessons.filter(lesson =>
                lesson.section_id.toString() === section._id.toString()
            );

            return {
                ...section,
                lessons: sectionLessons
            };
        });

        const totalCourseMinutes = sectionsWithLessons.reduce((total, section) => {
            const sectionDuration = section.lessons.reduce((secTotal, lesson) => {
                return secTotal + (lesson.duration || 0);
            }, 0);
            return total + sectionDuration;
        }, 0);

        return res.status(200).json({
            success: true,
            course: {
                ...course,
                lessons_length: lessons.length,
                totalDuration: formatDuration(totalCourseMinutes),
                sections: sectionsWithLessons
            }
        })
    } catch (error) {
        console.error("Lỗi trong quá trình lấy khóa học: ", error);
        return res.status(500).json({ success: false, message: "Lỗi server", error })
    }
}

export const getCoursesOfTeacher = async (req, res) => {
    try {
        const { teacher_id } = req.params;
        if (!teacher_id) {
            return res.status(401).json({ message: "Thiếu ID giảng viên" })
        }
        const courses = await Course.find({ teacher: teacher_id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });
    } catch (error) {
        console.error("Lỗi trong quá trình lấy khóa học: ", error);
        return res.status(500).json({ message: "Lỗi server", error })
    }
}

export const updateCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const updateData = req.body;
        const userId = req.userId;

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Không tìm thấy khóa học trong hệ thống" });
        }
        if (course.teacher_id && course.teacher_id !== userId && req.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "You are not the teacher of this course. You don't have permission to update it."
            });
        }

        if (req.file) {
            updateData.thumbnail = req.file.path;
        } else {
            delete updateData.thumbnail;
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Cập nhật khóa học thành công",
            data: updatedCourse
        });

    } catch (error) {
        console.error("Error updateCourse:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật khóa học",
            error: error.message
        });
    }
}

export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const deletedCourse = await Course.findByIdAndDelete(courseId);

        if (!deletedCourse) {
            return res.status(404).json({ message: "Khóa học không tồn tại" });
        }

        return res.status(200).json({
            success: true,
            message: "Xóa khóa học thành công"
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa khóa học", error: error.message });
    }
}

export const courseSearch = async (req, res) => {
    try {
        const { q } = req.body;
        if (!q) {
            return res.status(200).json({ success: true, data: [] })
        };

        const courses = await Course.find({
            $or: [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } }
            ]
        })

        return res.status(200).json({ success: true, data: courses })
    } catch (error) {
        console.error("Lỗi tìm kiếm khóa học: ", error);
        return res.status(500).json({ message: "Lỗi tìm kiếm khóa học", error: error.message });
    }
}

export const courseSearchAdvanced = async (req, res) => {
    try {
        const { q } = req.params;
        if (!q)
            return res.status(200).json({ success: true, data: [] })

        const results = await Course.aggregate([
            {
                $search: {
                    index: "yalina-search-courses",
                    text: {
                        query: q,
                        path: ["name", "description"],
                        fuzzy: {
                            maxEdits: 2,
                            prefixLength: 1
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "teacher_id",
                    foreignField: "_id",
                    as: "teacher_info"
                }
            },
            {
                $unwind: {
                    path: "$teacher_info",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    thumbnail: 1,
                    price: 1,
                    teacher: {
                        name: { $concat: ["$teacher_info.first_name", " ", "$teacher_info.last_name"] },
                    },
                    score: { $meta: "searchScore" }
                }
            }
        ]);

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error("Lỗi tìm kiếm khóa học: ", error);
        return res.status(500).json({ message: "Lỗi tìm kiếm khóa học", error: error.message });
    }
}

export const getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId)
            .populate({
                path: 'enrolled_courses',
                populate: {
                    path: 'teacher_id',
                }
            });

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách khóa học đã mua thành công",
            courses: user.enrolled_courses
        });

    } catch (error) {
        console.error("Lỗi khi lấy khóa học đã mua: ", error);
        return res.status(500).json({
            message: "Lỗi server",
            error: error.message
        });
    }
}