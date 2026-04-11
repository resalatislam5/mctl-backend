import { model, Schema } from 'mongoose';
import { ICreateTenant } from './tenant.dto';

const TenantSchema = new Schema<ICreateTenant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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

const Tenant = model('Tenant', TenantSchema);
export default Tenant;
