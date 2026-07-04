import mongoose, { Schema, Model } from 'mongoose';

export interface IProduct {
  id: string; // custom human-readable id like 'pixel-9-pro-xl'
  name: string;
  price: number;
  category: string;
  image: string;
  colors: string[];
  storages?: string[];
  sizes?: string[];
  rating: number;
  reviewsCount: number;
  specs: Map<string, string>;
  highlights: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    colors: [{ type: String }],
    storages: [{ type: String }],
    sizes: [{ type: String }],
    rating: { type: Number, default: 4.5 },
    reviewsCount: { type: Number, default: 0 },
    specs: { type: Map, of: String, default: {} },
    highlights: [{ type: String }],
    isNew: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product: Model<IProduct> = mongoose.models.Product
  ? (mongoose.models.Product as Model<IProduct>)
  : mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
