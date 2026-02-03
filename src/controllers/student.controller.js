import User from "../models/user.model.js";

export const getNumberStudentsInCourse = async(req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(400).json({message: "courseId trong params là bắt buộc"})
        }
        const students = await User.find({
            role: 'student',
            courses: courseId
        });
        
        return res.status(200).json({ length: students.length });
    } catch (error) {
        console.error('Lỗi lấy danh sách sinh viên trong khóa học:', error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message }); 
    }
}

export const getNumberAllStudents = async(req, res) => {
    try {
        const students = await User.find({
            role: 'student'
        });
        return res.status(200).json({ length: students.length });
    } catch (error) {
        console.error('Lỗi lấy danh sách sinh viên trong khóa học:', error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message }); 
    }
}

export const getStudentsInCourse = async(req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId) {
            return res.status(400).json({message: "courseId trong params là bắt buộc"})
        }
        const students = await User.find({
            role: 'student',
            courses: courseId
        });
        
        return res.status(200).json({students, length: students.length });
    } catch (error) {
        console.error('Lỗi lấy danh sách sinh viên trong khóa học:', error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message }); 
    }
}

export const getAllStudents = async(req, res) => {
    try {
        const students = await User.find({
            role: 'student'
        });
        return res.status(200).json({ students, length: students.length });
    } catch (error) {
        console.error('Lỗi lấy danh sách sinh viên trong khóa học:', error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message }); 
    }
}