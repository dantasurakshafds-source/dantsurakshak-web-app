import mongoose from 'mongoose'
const { Schema } = mongoose

const Lang = {
  en: { type: String, required: true },
  kn: { type: String, required: true },
}

const HabitsHealthSchema = new Schema({
  habit_health_main_title:  { ...Lang },
  habit_health_main_image:  { type: String, required: true },
  habit_health_repeater: [
    {
      description: [{ ...Lang }]
    }
  ]
}, { timestamps: true })

export default mongoose.models.HabitsHealth ||
       mongoose.model('HabitsHealth', HabitsHealthSchema)
