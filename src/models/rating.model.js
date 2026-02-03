import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const RatingSchema = new mongoose.Schema({
    user_id: {
        type: ObjectId,
        ref: 'User',
        required: true,
    },
    course_id: {
        type: ObjectId,
        ref: 'Course',
        required: true,
    },
    score: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: false,
        maxlength: 1000
    }
}, {
    timestamps: true
})

const Rating = mongoose.model('Rating', RatingSchema)
export default Rating;
