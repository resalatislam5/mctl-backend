import { model, Schema } from 'mongoose';

export type RoleTypes = {
  name: string;
  Permissions: PermissionTypes[];
  status: 'ACTIVE' | 'INACTIVE';
};

export type PermissionTypes = {
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
};

const RoleSchema = new Schema<RoleTypes>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    Permissions: {
      type: [
        {
          can_create: { type: Boolean, default: false },
          can_read: { type: Boolean, default: false },
          can_update: { type: Boolean, default: false },
          can_delete: { type: Boolean, default: false },
        },
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      trim: true,
      default: 'ACTIVE',
    },
  },
  { timestamps: true },
);

const Role = model('Role', RoleSchema);
export default Role;
