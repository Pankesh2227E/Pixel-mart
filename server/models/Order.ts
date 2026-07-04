import mongoose, { Schema, Model } from 'mongoose';

export interface IOrder {
  id: string; // custom generated short id or Mongo ID
  user?: mongoose.Types.ObjectId;
  items: Array<{
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
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  date: string;
  status: 'placed' | 'processing' | 'dispatched' | 'delivered';
}

const OrderSchema = new Schema<IOrder>(
  {
    id: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        product: {
          id: { type: String, required: true },
          name: { type: String, required: true },
          price: { type: Number, required: true },
          category: { type: String, required: true },
          image: { type: String, required: true },
        },
        quantity: { type: Number, required: true },
        selectedColor: { type: String, required: true },
        selectedOption: { type: String, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ['placed', 'processing', 'dispatched', 'delivered'],
      default: 'placed',
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order
  ? (mongoose.models.Order as Model<IOrder>)
  : mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
