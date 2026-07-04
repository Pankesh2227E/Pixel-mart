import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  wishlist?: string[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    wishlist: { type: [String], default: [] },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User
  ? (mongoose.models.User as Model<IUser>)
  : mongoose.model<IUser>('User', UserSchema);

export default User;
