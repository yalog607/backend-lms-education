import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["course", "lesson", "system", "promotion"],
      default: "course",
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
      default: "",
    },
    meta: {
      type: Object,
      default: {},
    }
}, {
    timestamps: true
})
NotificationSchema.index({ user_id: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', NotificationSchema)
export default Notification;