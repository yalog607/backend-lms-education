import Course from "../models/course.model.js"

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

        return res.status(200).json({
            message: "Lấy toàn bộ danh sách khóa học thành công",
            courses
        })
    } catch (error) {
        console.error("Lỗi database Courses: ", error)
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
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
        const { courseId } = req.params;
        const course = await Course.findOne({ courseId });

        return res.status(200).json({
            message: "Lấy khóa học thành công",
            course
        })
    } catch (error) {
        console.error("Lỗi trong quá trình lấy khóa học: ", error);
        return res.status(500).json({ message: "Lỗi server", error })
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

        if (course.teacher_id.toString() !== userId) {
            return res.status(403).json({ 
                success: false, 
                message: "Bạn không có quyền chỉnh sửa khóa học của người khác" 
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

export const courseSearch = async(req, res) => {
    try {
        const { q } = req.body;
        if (!q) {
            return res.status(200).json({success: true, data: []})
        };

        const courses = await Course.find({
            $or: [
                { name: {$regex: q, $options: "i"}},
                { description: {$regex: q, $options: "i"}}
            ]
        })

        return res.status(200).json({success: true, data: courses})
    } catch (error) {
        console.error("Lỗi tìm kiếm khóa học: ", error);
        return res.status(500).json({message: "Lỗi tìm kiếm khóa học", error: error.message});
    }
}

export const courseSearchAdvanced = async(req, res) => {
    try {
        const { q } = req.body;
        if (!q) 
            return res.status(200).json({success: true, data: []})
        
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
                $limit: 10
            },
            {
                $project: {
                    title: 1,
                    thumbnail: 1,
                    price: 1,
                    score: { $meta: "searchScore" }
                }
            }
        ]);

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error("Lỗi tìm kiếm khóa học: ", error);
        return res.status(500).json({message: "Lỗi tìm kiếm khóa học", error: error.message});
    }
}