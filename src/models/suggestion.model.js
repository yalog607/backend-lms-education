import mongoose from 'mongoose';

const suggestionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    isAddressed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
const Suggestion = mongoose.model('Suggestion', suggestionSchema)
export default Suggestion;