import Section from "../models/section.model.js";
import Lesson from "../models/lesson.model.js";

const getNewOrderIndex = async (course_id) => {
    const lastSection = await Section.findOne({course_id}).sort({ orderIndex: -1 });
    return lastSection ? lastSection.orderIndex + 1 : 1;
};

export const getSectionsOfCourse = async (req, res) => {
    try {
        const { course_id } = req.params;

        const sections = await Section.find({ course_id })
            .sort({ orderIndex: 1 });

        return res.status(200).json({
            success: true,
            data: sections
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getSectionById = async(req, res) => {
    try {
        const { sectionId } = req.params;
        const section = await Section.findById(sectionId);

        return res.status(200).json({success: true, data: section})
    } catch (error) {
        console.error("Lỗi lấy section: ", error);
        return res.status(500).json({success: false, message: "Lỗi lấy section."})
    }
}

export const createSection = async (req, res) => {
    try {
        const { title, course_id, isPublished } = req.body;
        const Course = (await import('../models/course.model.js')).default;
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
        }
        if (req.role !== 'admin' && (!course.teacher_id || course.teacher_id.toString() !== req.userId)) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thao tác với section của khóa học này' });
        }
        const newSection = await Section.create({
            title,
            course_id,
            isPublished,
            orderIndex: await getNewOrderIndex(course_id)
        });
        return res.status(201).json({
            success: true,
            data: newSection
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateSection = async (req, res) => {
    try {
        const { id } = req.params;
        const section = await Section.findById(id);
        if (!section) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy chương học' });
        }
        const Course = (await import('../models/course.model.js')).default;
        const course = await Course.findById(section.course_id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
        }
        if (req.role !== 'admin' && (!course.teacher_id || course.teacher_id.toString() !== req.userId)) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thao tác với section của khóa học này' });
        }
        const updatedSection = await Section.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        return res.status(200).json({
            success: true,
            data: updatedSection
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteSection = async (req, res) => {
    try {
        const { id } = req.params;
        const section = await Section.findById(id);
        if (!section) {
            return res.status(404).json({ success: false, message: 'Chương học không tồn tại' });
        }
        const Course = (await import('../models/course.model.js')).default;
        const course = await Course.findById(section.course_id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học' });
        }
        if (req.role !== 'admin' && (!course.teacher_id || course.teacher_id.toString() !== req.userId)) {
            return res.status(403).json({ success: false, message: 'Bạn không có quyền thao tác với section của khóa học này' });
        }
        const deletedSection = await Section.findByIdAndDelete(id);
        // Xóa tất cả bài học thuộc chương này để tránh dữ liệu mồ côi
        await Lesson.deleteMany({ section_id: id });
        return res.status(200).json({
            success: true,
            message: "Xóa chương học và các bài học liên quan thành công"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};