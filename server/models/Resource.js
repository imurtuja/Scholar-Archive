import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: false
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['pdf', 'image', 'link', 'text'],
        required: true
    },
    category: {
        type: String,
        enum: ['questions', 'papers', 'notes', 'other'],
        default: 'notes'
    },
    link: {
        type: String,
        required: function () { return !this.content && (this.type === 'link' || this.type === 'pdf' || this.type === 'image'); }
    },
    content: {
        type: String,
        required: function () { return !this.link && this.type === 'text'; }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Resource', resourceSchema);
