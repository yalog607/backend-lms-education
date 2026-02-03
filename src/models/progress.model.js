import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    lesson_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    last_watched: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

const Progress = mongoose.model('Progress', ProgressSchema)
export default Progress;