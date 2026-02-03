import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    lesson_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true,
    }

}, {
    timestamps: true
})

const Comment = mongoose.model('Comment', CommentSchema)
export default Comment;