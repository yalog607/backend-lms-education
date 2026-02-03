import mongoose from 'mongoose';
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const UserSchema = new Schema({
    role: {
        type: String,
        enum: {
            values: ['student', 'instructor', 'admin'],
            message: '{VALUE} is not supported'
        },
        default: 'student'
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    }, 
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: false,
        default: '0xxxxxxxxx'
    },
    enrolled_courses: [{
        type: ObjectId,
        ref: 'Course'
    }],
    balance: {
        type: Number,
        default: 0
    },
    comment: [{
        type: ObjectId,
        ref: 'Comment'
    }],
    avatar: {
        type: String
    }
}, {
    timestamps: true,
})

const User = mongoose.model('User', UserSchema);

export default User;