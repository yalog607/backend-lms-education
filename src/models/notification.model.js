import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    isRead: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
})

const Notification = mongoose.model('Notification', NotificationSchema)
export default Notification;