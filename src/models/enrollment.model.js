import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    pricePaid: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true
})

const Enrollment = mongoose.model('Enrollment', EnrollmentSchema)
export default Enrollment;