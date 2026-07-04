import mongoose, { Schema, Model } from 'mongoose';

export interface ICategory {
  name: string;
  slug: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Category: Model<ICategory> = mongoose.models.Category 
  ? (mongoose.models.Category as Model<ICategory>)
  : mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
