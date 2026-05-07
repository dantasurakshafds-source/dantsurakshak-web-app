import mongoose, { Schema, model, models } from 'mongoose';
const NotificationSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    icon: { type: String, default: 'notifications' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    questionnaire_Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Questionnaire' }, 
});
export default models.Notification || model('Notification', NotificationSchema);
