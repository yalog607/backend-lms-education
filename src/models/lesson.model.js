import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['video', 'article', 'quiz'], 
        default: 'video'
    },
    orderIndex: {
        type: Number,
        required: true,
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    section_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    },
    isFree: {
        type: Boolean,
        default: false
    },
    orderIndex: {
        type: Number,
        required: true,
    },
    video_url: {
        type: String,
        required: function() {
            return this.type === 'video';
        }
    },
    muxAssetId: { type: String }, // Quản lý video
    muxPlaybackId: { type: String }, // Phát video
    duration: { type: Number, default: 0 },
    videoSource: {
        type: String,
        enum: ['upload', 'youtube'],
        default: 'upload'
    },
    youtubeId: { type: String }
}, {
    timestamps: true
})

const Lesson = mongoose.model('Lesson', LessonSchema)
export default Lesson;