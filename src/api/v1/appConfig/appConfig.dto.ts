import { Document, Types } from 'mongoose';

export interface IBaseAppConfig {
  tenant_id: Types.ObjectId;
  logo: string | null;
  favicon: string | null;
  logo_public_id: string | null;
  favicon_public_id: string | null;
  company_name: string | null;
  short_company_name: string | null;
  domain_name: string | null;
  support_email: string | null;
  address: string | null;
  phone: string | null;
  phone_2: string | null;
  enrollment_color: string | null;
  seal_stamp: string | null;
  seal_stamp_public_id: string | null;
}

export interface ICreateAppConfig extends IBaseAppConfig, Document {}
export interface IAppConfigList extends IBaseAppConfig {
  _id?: string | Types.ObjectId;
}

export interface IAppConfigFindAllParams {
  tenant_id: Types.ObjectId;
}
