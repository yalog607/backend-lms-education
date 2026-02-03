import Suggestion from "../models/suggestion.model.js";

export const createSuggestion = async (req, res) => {
    try {
        const { content } = req.body;
        const user_id = req.userId;

        if (!content) {
            return res.status(400).json({ success: false, message: "Nội dung góp ý không được để trống" });
        }

        const suggestion = await Suggestion.create({
            user_id,
            content
        });

        res.status(201).json({
            success: true,
            data: suggestion
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSuggestions = async (req, res) => {
    try {
        const suggestions = await Suggestion.find()
            .populate("user_id", "fName lName email avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: suggestions.length,
            data: suggestions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const approveSuggestion = async (req, res) => {
    try {
        const { id } = req.params;

        // Cập nhật isAddressed thành true (Đã xử lý/Chấp nhận)
        const updatedSuggestion = await Suggestion.findByIdAndUpdate(
            id,
            { isAddressed: true },
            { new: true }
        );

        if (!updatedSuggestion) {
            return res.status(404).json({ success: false, message: "Không tìm thấy góp ý" });
        }

        res.status(200).json({
            success: true,
            message: "Đã đánh dấu góp ý là đã xử lý",
            data: updatedSuggestion
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const rejectSuggestion = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSuggestion = await Suggestion.findByIdAndDelete(id);

        if (!deletedSuggestion) {
            return res.status(404).json({ success: false, message: "Không tìm thấy góp ý" });
        }

        res.status(200).json({
            success: true,
            message: "Đã từ chối và gỡ bỏ góp ý"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};