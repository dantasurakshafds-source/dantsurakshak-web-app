import mongoose from 'mongoose';
const { Schema } = mongoose;

const Lang = {
  en: { type: String, required: true },
  kn: { type: String, required: true },
};

const DentalEmerDescriptionRepeaterSchema = new Schema({
  denatl_emer_tab_heading: { ...Lang },
  denatl_emer_tab_paragraph: { ...Lang },
}, { _id: false });

const DentalEmerRepeaterSchema = new Schema({
  dental_emer_tab_title: { ...Lang },
  denatl_emer_description_repeater: [DentalEmerDescriptionRepeaterSchema],
}, { _id: false });

const DentalEmergencySchema = new Schema({
  dental_emergency_title: { ...Lang },
  dental_emergency_image: { type: String },
  dental_emergency_heading: { ...Lang },
  dental_emergency_para: { ...Lang },
  dental_emergency_icon: { type: String },

  dental_emergency_inner_title: { ...Lang },
  dental_emergency_inner_para: { ...Lang },
  dental_emergency_inner_icon: { type: String },

  dental_emer_title: { ...Lang },
  dental_emer_sub_title: { ...Lang },
  dental_emer_repeater: [DentalEmerRepeaterSchema],
}, { timestamps: true });

const DentalEmergency = mongoose.models.DentalEmergency || mongoose.model('DentalEmergency', DentalEmergencySchema);
export default DentalEmergency;
