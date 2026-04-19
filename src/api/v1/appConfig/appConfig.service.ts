import { ClientSession, Types, UpdateQuery } from 'mongoose';

import { IAppConfigFindAllParams, IAppConfigList } from './appConfig.dto';
import AppConfig from './appConfig.model';

const findAll = ({ tenant_id }: IAppConfigFindAllParams) => {
  const query: Record<string, unknown> = { tenant_id };

  return AppConfig.find(query);
};

const findOne = (key: Partial<IAppConfigList>) => {
  return AppConfig.findOne(key);
};

const update = (
  {
    favicon,
    logo,
    favicon_public_id,
    logo_public_id,
    tenant_id,
    company_name,
    domain_name,
    support_email,
    address,
    phone,
    phone_2,
    short_company_name,
    enrollment_color,
    seal_stamp,
    seal_stamp_public_id,
  }: IAppConfigList,
  session?: ClientSession | null,
) => {
  return AppConfig.findOneAndUpdate(
    { tenant_id }, // 🔑 unique identifier
    {
      $set: {
        ...(favicon && { favicon }),
        ...(logo && { logo }),
        ...(favicon_public_id && { favicon_public_id }),
        ...(logo_public_id && { logo_public_id }),
        ...(company_name && { company_name }),
        ...(domain_name && { domain_name }),
        ...(support_email && { support_email }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(phone_2 && { phone_2 }),
        ...(short_company_name && { short_company_name }),
        ...(enrollment_color && { enrollment_color }),
        ...(seal_stamp && { seal_stamp }),
        ...(seal_stamp_public_id && { seal_stamp_public_id }),
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      ...(session && { session }),
    },
  );
};

export default { findAll, findOne, update };
