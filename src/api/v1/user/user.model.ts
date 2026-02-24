import bcrypt from 'bcrypt';
import mongoose, { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role_id: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE';
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    // role_id: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    role_id: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      trim: true,
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  },
);

// ✅ Modern async pre-save hook
UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = model<IUser>('User', UserSchema);
export default User;
