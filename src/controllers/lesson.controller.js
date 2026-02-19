import Lesson from "../models/lesson.model.js";
import { video } from "../lib/mux.js";

const getNewOrderIndex = async (section_id) => {
    const lastLesson = await Lesson.findOne({ section_id }).sort({ orderIndex: -1 });
    return lastLesson ? lastLesson.orderIndex + 1 : 1;
};

const extractYouTubeID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export const getFreeLessons = async (req, res) => {
    try {
        const { sectionIds } = req.body;
        const lessons = await Lesson.find({
            section_id: { $in: sectionIds },
            isFree: true
        }).sort({ orderIndex: 1 });

        res.status(200).json({ success: true, data: lessons });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy bài học dùng thử", error: error.message });
    }
}

export const getLessons = async (req, res) => {
    try {
        const { section_id } = req.params;
        const lessons = await Lesson.find({ section_id }).sort({ orderIndex: 1 });

        res.status(200).json({ success: true, data: lessons });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách bài học", error: error.message });
    }
}

export const getLesson = async(req, res) => {
    try {
        const { lessonId } = req.params;

        const lesson = await Lesson.findById(lessonId);

        return res.status(200).json({success: true, data: lesson});
    } catch (error) {
        console.error("Loi lay bai hoc:", error);
        return res.status(500).json({success: false, message: "Loi lay bai hoc"})
    }
}

export const createLesson = async (req, res) => {
    try {
        const { title, section_id, type, content, video_url, isFree, videoSource, isPublished } = req.body;

        let lessonData = {
            title,
            section_id,
            type,
            content,
            video_url,
            isFree,
            isPublished,
            videoSource: videoSource || 'upload',
            orderIndex: await getNewOrderIndex(section_id)
        };

        if (type === 'video' && lessonData.videoSource === 'upload' && video_url) {
            try {
                const asset = await video.assets.create({
                    input: video_url,
                    playback_policy: ['signed'],
                    mp4_support: 'none',
                    test: false
                });

                lessonData.muxAssetId = asset.id;
                lessonData.muxPlaybackId = asset.playback_ids?.[0]?.id;
                lessonData.duration = asset.duration || 0;

            } catch (muxError) {
                console.error("Lỗi Mux:", muxError);
                return res.status(500).json({ message: "Lỗi xử lý video với Mux" });
            }
        }
        else if (type === 'video' && lessonData.videoSource === 'youtube' && video_url) {
            const youtubeId = extractYouTubeID(video_url);
            
            if (!youtubeId) {
                return res.status(400).json({ message: "Link YouTube không hợp lệ" });
            }

            lessonData.youtubeId = youtubeId;
        }

        const newLesson = await Lesson.create(lessonData);

        return res.status(201).json({
            success: true,
            message: "Tạo bài học thành công! Video đang được xử lý.",
            data: newLesson
        });
    } catch (error) {
        res.status(500).json({ message: "Không thể tạo bài học", error: error.message });
    }
}

export const deleteLesson = async (req, res) => {
    try {

        const { lessonId } = req.params;

        const lessonToDelete = await Lesson.findById(lessonId);
        if (!lessonToDelete) {
            return res.status(404).json({ message: "Bài học không tồn tại" });
        }

        const sectionId = lessonToDelete.section_id;

        await Lesson.findByIdAndDelete(id);

        const remainingLessons = await Lesson.find({ section_id: sectionId }).sort({ orderIndex: 1 });

        if (remainingLessons.length > 0) {
            const bulkOps = remainingLessons.map((lesson, index) => ({
                updateOne: {
                    filter: { _id: lesson._id },
                    update: { $set: { orderIndex: index + 1 } }, // Gán lại index bắt đầu từ 1
                },
            }));

            await Lesson.bulkWrite(bulkOps);
        }

        res.status(200).json({
            success: true,
            message: "Đã xóa và cập nhật lại thứ tự các bài học thành công"
        });
        res.status(200).json({ success: true, message: "Đã xóa bài học thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa bài học", error: error.message });
    }
}

export const updateLesson = async (req, res) => {
    try {
        const { lessonId } = req.params;
        const updatedLesson = await Lesson.findByIdAndUpdate(
            lessonId,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedLesson) return res.status(404).json({ message: "Không tìm thấy bài học" });

        res.status(200).json({ success: true, data: updatedLesson });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật bài học", error: error.message });
    }
}

export const getRecentLessonOfTeacher = async (req, res) => {
    try {
        const lessons = await Lesson.find()
            .populate({
                path: 'section_id',
                populate: {
                    path: 'course_id',
                    match: { teacher_id: req.userId }
                }
            })
            .sort({ createdAt: -1 })
            .limit(5);

        const filteredLessons = lessons.filter(l => l.section_id && l.section_id.course_id);

        res.status(200).json({ success: true, data: filteredLessons });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy bài học gần đây", error: error.message });
    }
}
