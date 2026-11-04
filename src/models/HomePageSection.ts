import mongoose, { Schema, Document } from "mongoose";

export interface ISectionItem {
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  tags?: string[];
  link?: string;
}

export interface IHomePageSection extends Document {
  sectionKey: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  image?: string;
  items?: ISectionItem[];
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SectionItemSchema = new Schema<ISectionItem>(
  {
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
    tags: { type: [String], default: [] },
    link: { type: String, default: "" },
  },
  { _id: false }
);

const HomePageSectionSchema = new Schema<IHomePageSection>(
  {
    sectionKey: {
      type: String,
      required: [true, "Section key is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: [true, "Section title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    badge: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    items: {
      type: [SectionItemSchema],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.HomePageSection ||
  mongoose.model<IHomePageSection>("HomePageSection", HomePageSectionSchema);

