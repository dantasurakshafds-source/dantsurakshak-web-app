import mongoose, { Schema, Document } from 'mongoose';
 
export interface ICategory extends Document {
  feature_main_title: { en: string; kn: string };
  feature_slug: { en: string; kn: string };
  feature_main_image?: string;
  feature_inner_title: { en: string; kn: string };
  feature_inner_description: { en: string; kn: string };
  feature_inner_image?: string;
  feature_myth_facts_title: { en: string; kn: string };
  feature_myth_facts_description: { en: string; kn: string };
  feature_myths: Array<{ para: { en: string; kn: string }; icon: string }>;
  feature_facts: Array<{ para: { en: string; kn: string }; icon: string }>;
  
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    feature_main_title: {
      en: { type: String, required: true },
      kn: { type: String, required: true }
    },
    feature_slug: {
      en: { type: String, required: true },
      kn: { type: String, required: true }
    },
    feature_main_image: { type: String },
    feature_inner_title: {
      en: { type: String, required: true },
      kn: { type: String, required: true }
    },
    feature_inner_description: {
      en: { type: String, required: true },
      kn: { type: String, required: true }
    },
    feature_inner_image: { type: String },
    feature_myth_facts_title: {
      en: { type: String, required: true },
      kn: { type: String, required: true }
    },
    feature_myth_facts_description: {

      en: { type: String, required: true },
      kn: { type: String, required: true }

    },
    feature_myths: [
      {
        para: {
          en: { type: String, required: true },
          kn: { type: String, required: true }
        },
        icon: { type: String, required: true }
      }
    ],
    feature_facts: [
      {
        para: {
          en: { type: String, required: true },
          kn: { type: String, required: true }
        },
        icon: { type: String, required: true }
      }
    ],
     

  },
  { timestamps: true }
);

 

CategorySchema.virtual('diseases', {
  ref: 'diseases',  
  localField: '_id',
  foreignField: 'category',
  justOne: false   
});

CategorySchema.set('toObject', { virtuals: true });
CategorySchema.set('toJSON', { virtuals: true });


export default mongoose.models.categories ||
  mongoose.model<ICategory>('categories', CategorySchema);
