import mongoose, { Schema, Model } from 'mongoose';

export interface ICartItem {
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
  };
  quantity: number;
  selectedColor: string;
  selectedOption: string;
}

export interface ICart {
  userId?: string;
  sessionId?: string;
  items: ICartItem[];
}

const CartItemSchema = new Schema({
  product: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
  },
  quantity: { type: Number, required: true, default: 1 },
  selectedColor: { type: String, required: true },
  selectedOption: { type: String, required: true },
});

const CartSchema = new Schema<ICart>(
  {
    userId: { type: String, index: true },
    sessionId: { type: String, index: true },
    items: [CartItemSchema],
  },
  { timestamps: true }
);

const Cart: Model<ICart> = mongoose.models.Cart
  ? (mongoose.models.Cart as Model<ICart>)
  : mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
