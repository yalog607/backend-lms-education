import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    orderIndex: {
        type: Number,
        required: true,
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }
}, {
    timestamps: true
})

const Section = mongoose.model('Section', SectionSchema)

export default Section;