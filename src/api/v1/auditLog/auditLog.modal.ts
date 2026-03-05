import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  user_id: mongoose.Types.ObjectId;
  user_name?: string;
  action: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entity_id?: mongoose.Types.ObjectId;
  changes?: string;
  ip_address?: string;
  user_agent?: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    user_name: {
      type: String,
    },

    action: {
      type: String,
      enum: ['LOGIN', 'CREATE', 'UPDATE', 'DELETE'],
      required: true,
    },

    entity: {
      type: String,
      required: true,
    },

    entity_id: {
      type: Schema.Types.ObjectId,
    },

    changes: {
      type: String,
    },
    description: {
      type: String, // human readable log
    },

    ip_address: {
      type: String,
    },

    user_agent: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLog;
