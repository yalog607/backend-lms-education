import Progress from "../models/progress.model.js";

export const updateProgress = async (req, res) => {
    try {
        const { lesson_id, last_watched, duration } = req.body;
        const user_id = req.userId;

        let isCompleted = false;
        if (duration > 0 && (last_watched/duration) >= 0.9) {
            isCompleted = true;
        }

        const progress = await Progress.findOneAndUpdate({
            user_id, lesson_id
        }, {
            last_watched,
            $set: isCompleted ? {isCompleted: true} : {}
        }, {
            upsert: true,
            new: true
        })  

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error) {
        console.error("Lỗi lưu tiến trình: ", error);
        res.status(500).json({
            success: false,
            message: "Lỗi lưu tiến trình"
        });
    }
};

export const getCourseProgress = async (req, res) => {
    try {
        const { lessonIds } = req.body; 
        const user_id = req.userId;

        const progressList = await Progress.find({ 
            user_id, 
            lesson_id: { $in: lessonIds } 
        });

        res.status(200).json({
            success: true,
            data: progressList
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProgress = async (req, res) => {
    try {
        const { lesson_id } = req.params;
        const user_id = req.userId;

        const progress = await Progress.findOne({ user_id, lesson_id });

        if (!progress) {
            return res.status(200).json({
                success: true,
                data: { last_watched: 0, isCompleted: false }
            });
        }

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.userId;

        const deletedProgress = await Progress.findOneAndDelete({ _id: id, user_id });

        if (!deletedProgress) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy tiến độ học tập"
            });
        }

        res.status(200).json({
            success: true,
            message: "Xóa tiến độ thành công"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
