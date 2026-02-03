import Comment from "../models/comment.model.js";

export const getComments = async(req, res) => {
    try {
        const { lessonId } = req.params;

        const comments = await Comment.find({ lesson: lessonId })
            .populate("user", "fName lName avatar") // Chỉ lấy các trường cần thiết của User
            .sort({ createdAt: -1 }); // Bình luận mới nhất lên đầu

        res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } catch (error) {
        res.status(500).json({ message: "Không thể tải bình luận", error: error.message });
    }
}

export const createComment = async(req, res) => {
try {
        const { content, lessonId } = req.body;
        const userId = req.userId;

        if (!content) {
            return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
        }

        const newComment = await Comment.create({
            content,
            user: userId,
            lesson: lessonId
        });

        const populatedComment = await newComment.populate("user", "fName lName avatar");

        res.status(201).json({
            success: true,
            message: "Đã gửi bình luận",
            data: populatedComment
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi gửi bình luận", error: error.message });
    }
}

export const deleteComment = async(req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.userId;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Bình luận không tồn tại" });
        }

        if (comment.user.toString() !== userId) {
            return res.status(403).json({ message: "Bạn không có quyền xóa bình luận này" });
        }

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({
            success: true,
            message: "Xóa bình luận thành công"
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa bình luận", error: error.message });
    }
}