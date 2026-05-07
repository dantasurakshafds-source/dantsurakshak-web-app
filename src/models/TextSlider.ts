import mongoose from 'mongoose';
const { Schema } = mongoose;

const Lang = {
  en: { type: String, required: true },
  kn: { type: String, required: true },
};

const TextSliderSchema = new Schema(
  {
    slider_text: { ...Lang },  
  },
  { timestamps: true }
);

const TextSlider =
  mongoose.models.textslides || mongoose.model('textslides', TextSliderSchema);
export default TextSlider;
