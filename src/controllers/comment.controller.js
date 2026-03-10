import Comment from "../models/comment.model.js";

export const getComments = async(req, res) => {
    try {
        const { lessonId } = req.params;

        const comments = await Comment.find({ lesson_id: lessonId })
            .populate("user_id", "first_name last_name avatar") 
            .sort({ createdAt: -1 });
            
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
        const { content, lesson_id } = req.body;
        const userId = req.userId;

        if (!content) {
            return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
        }

        const newComment = await new Comment({
            content,
            lesson_id,
            user_id: userId,
        });

        await newComment.save();

        res.status(201).json({
            success: true,
            message: "Post a comment successfully!"
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi gửi bình luận", error: error.message });
        console.error("Lỗi khi gửi bình luận:", error);
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

        if (comment.user_id.toString() !== userId) {
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