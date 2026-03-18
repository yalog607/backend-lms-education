import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import Section from "../models/section.model.js";
import Lesson from "../models/lesson.model.js";

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

export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await User.find({role: 'instructor'}).select('-password');
        res.status(200).json({ teachers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id).populate('teacher_id', 'first_name last_name email').lean();
        if (!course) {
            return res.status(404).json({ message: "This course doesn't exist!" });
        }

        const sections = await Section.find({ course_id: id }).sort({ orderIndex: 1 }).lean();
        const sectionIds = sections.map(section => section._id);

        const lessons = await Lesson.find({ section_id: { $in: sectionIds } })
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