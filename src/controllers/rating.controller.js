import Rating from "../models/rating.model.js";

export const createRating = async (req, res) => {
    try {
        const { course_id, score, review } = req.body;
        const user_id = req.userId;

        const existingRating = await Rating.findOne({ user_id, course_id });

        if (existingRating) {
            existingRating.score = score;
            existingRating.review = review;
            await existingRating.save();
            
            return res.status(200).json({
                success: true,
                message: "Cập nhật đánh giá thành công",
                data: existingRating
            });
        }

        const newRating = await Rating.create({
            user_id,
            course_id,
            score,
            review
        });

        res.status(201).json({
            success: true,
            data: newRating
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getRatings = async (req, res) => {
    try {
        const { course_id } = req.params;

        const ratings = await Rating.find({ course_id })
            .populate("user_id", "first_name last_name avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: ratings.length,
            data: ratings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteRating = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.userId;

        const deletedRating = await Rating.findOneAndDelete({ _id: id, user_id });

        if (!deletedRating) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đánh giá hoặc bạn không có quyền xóa"
            });
        }

        res.status(200).json({
            success: true,
            message: "Xóa đánh giá thành công"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};