import { NextFunction, Request, Response } from 'express';
import auditLogService from '../auditLog/auditLog.service';

import { withTransaction } from '../../../utils/withTransaction';
import { IAppConfigList } from './appConfig.dto';
import appConfigService from './appConfig.service';
import { UploadApiResponse } from 'cloudinary';
import cloudinary from '../../../config/cloudinary.config';
import streamifier from 'streamifier';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await appConfigService.findAll({
      tenant_id: req.user?.tenant_id,
    });

    res.json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { company_name, domain_name, support_email, address, phone, phone_2 } =
    req.body as IAppConfigList;

  const findSingle = await appConfigService.findOne({
    tenant_id: req.user?.tenant_id,
  });

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  const logo = files?.logo?.[0];
  const favicon = files?.favicon?.[0];
  let logoUrl: string | null = null;
  let logoPublicId: string | null = null;
  let faviconUrl: string | null = null;
  let faviconPublicId: string | null = null;

  if (logo) {
    if (findSingle?.logo_public_id) {
      await cloudinary.uploader.destroy(findSingle.logo_public_id);
    }

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'app_info' },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        },
      );
      streamifier
        .createReadStream((logo as Express.Multer.File).buffer)
        .pipe(stream);
    });
    logoUrl = result.secure_url;
    logoPublicId = result.public_id;
  }

  if (favicon) {
    if (findSingle?.favicon_public_id) {
      await cloudinary.uploader.destroy(findSingle.favicon_public_id);
    }

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'app_info' },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        },
      );
      streamifier
        .createReadStream((favicon as Express.Multer.File).buffer)
        .pipe(stream);
    });
    faviconUrl = result.secure_url;
    faviconPublicId = result.public_id;
  }

  try {
    const data = await withTransaction(async (session) => {
      const data = await appConfigService.update(
        {
          favicon: faviconUrl,
          logo: logoUrl,
          favicon_public_id: faviconPublicId,
          logo_public_id: logoPublicId,
          tenant_id: req.user?.tenant_id,
          company_name,
          domain_name,
          support_email,
          address,
          phone,
          phone_2,
        },
        session,
      );

      await auditLogService.create(
        {
          req,
          user: req.user,
          action: 'UPDATE',
          entity: 'AppConfig',
          entity_id: data?._id,
          description: `A new app config has been created app_config_id: ${data?._id?.toString()}`,
        },
        session,
      );

      return data;
    });

    res.json({
      success: true,
      message: 'App config updated',
      data,
    });
  } catch (err) {
    next(err);
  }
};

export default { findAll, update };
