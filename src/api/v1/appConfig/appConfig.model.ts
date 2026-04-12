import { model, Schema, Types } from 'mongoose';
import { ICreateAppConfig } from './appConfig.dto';

const AppConfigSchema = new Schema<ICreateAppConfig>(
  {
    tenant_id: {
      type: Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    logo: {
      type: String,
      trim: true,
      default: null,
    },
    company_name: {
      type: String,
      trim: true,
      default: null,
    },
    domain_name: {
      type: String,
      trim: true,
      default: null,
    },
    support_email: {
      type: String,
      trim: true,
      default: null,
    },
    address: {
      type: String,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    phone_2: {
      type: String,
      trim: true,
      default: null,
    },
    favicon: {
      type: String,
      trim: true,
      default: null,
    },
    logo_public_id: {
      type: String,
      trim: true,
      default: null,
    },
    favicon_public_id: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const AppConfig = model('AppConfig', AppConfigSchema);
export default AppConfig;
