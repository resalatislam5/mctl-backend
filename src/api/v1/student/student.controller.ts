import { UploadApiResponse } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import streamifier from 'streamifier';
import cloudinary from '../../../config/cloudinary.config';
import { IParams } from '../../../types/commonTypes';
import { checkMongooseId } from '../../../utils/checkMongooseId';
import { customError } from '../../../utils/customError';
import { detectChanges } from '../../../utils/detectChanges';
import auditLogService from '../auditLog/auditLog.service';
import { IStudentList } from './student.dto';
import studentService from './student.service';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';
  try {
    const [data, total] = await Promise.all([
      studentService
        .findAll({ search, status })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .select('name email code mobile_no gender nid_no status createdAt'),
      studentService.count({ search, status }),
    ]);
    res.json({ success: true, total, data });
  } catch (err) {
    next(err);
  }
};

const findSingle = async (
  req: Request<IParams>,
  res: Response,
  next: NextFunction,
) => {
  const { _id } = req.params;
  try {
    checkMongooseId(_id);

    const objId = new mongoose.Types.ObjectId(_id);
    const data = await studentService.aggregate([
      { $match: { _id: objId } },

      {
        $lookup: {
          from: 'countries',
          localField: 'country_id',
          foreignField: '_id',
          as: 'countries',
        },
      },
      {
        $unwind: {
          path: '$countries',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $addFields: { country_name: { $ifNull: ['$countries.name', null] } } },
      {
        $lookup: {
          from: 'divisions',
          localField: 'division_id',
          foreignField: '_id',
          as: 'divisions',
        },
      },
      {
        $unwind: {
          path: '$divisions',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $addFields: { division_name: { $ifNull: ['$divisions.name', null] } } },
      {
        $lookup: {
          from: 'districts',
          localField: 'district_id',
          foreignField: '_id',
          as: 'districts',
        },
      },
      {
        $unwind: {
          path: '$districts',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $addFields: { district_name: { $ifNull: ['$districts.name', null] } } },
      {
        $lookup: {
          from: 'upazilas',
          localField: 'upazila_id',
          foreignField: '_id',
          as: 'upazilas',
        },
      },
      {
        $unwind: {
          path: '$upazilas',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $addFields: { upazila_name: { $ifNull: ['$upazilas.name', null] } } },
      {
        $project: {
          countries: 0,
          divisions: 0,
          districts: 0,
          upazilas: 0,
        },
      },
    ]);

    if (!data[0]) {
      customError('Student not found', 404);
    }
    res.json({ success: true, data: data[0] });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const {
    name,
    co_mobile,
    mobile_no,
    code,
    country_id,
    division_id,
    district_id,
    dob,
    education,
    email,
    gender,
    nationality,
    nid_no,
    occupation,
    office_address,
    upazila_id,
    relationship,
    village,
    status,
  } = req.body as IStudentList;
  try {
    let imageUrl = '';
    let publicId = '';

    if (req.file) {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'students' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );

        streamifier
          .createReadStream((req.file as Express.Multer.File).buffer)
          .pipe(stream);
      });

      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    const data = await studentService.create({
      name,
      co_mobile,
      mobile_no,
      code,
      country_id,
      division_id,
      district_id,
      dob,
      education,
      email,
      gender,
      image: imageUrl,
      nationality,
      nid_no,
      occupation,
      office_address,
      upazila_id,
      relationship,
      village,
      image_public_id: publicId,
      status,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'Student',
      entity_id: data?._id?.toString() as string,
      description: `A new Student has been created Student_id: ${data?._id?.toString()}`,
    });

    res.json({
      success: true,
      message: 'Student created successfully',
      data,
    });
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  const {
    name,
    co_mobile,
    mobile_no,
    code,
    country_id,
    division_id,
    district_id,
    dob,
    education,
    email,
    gender,
    nationality,
    nid_no,
    occupation,
    office_address,
    upazila_id,
    relationship,
    village,
    status,
  } = (req?.body || {}) as IStudentList;

  try {
    checkMongooseId(_id as string);

    const findSingle = await studentService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Student not found', 404);
    }

    let imageUrl = findSingle.image;
    let publicId = findSingle.image_public_id;

    if (req.file) {
      if (findSingle.image_public_id) {
        await cloudinary.uploader.destroy(findSingle.image_public_id);
      }

      // upload new image

      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'students' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          },
        );

        streamifier
          .createReadStream((req.file as Express.Multer.File).buffer)
          .pipe(stream);
      });

      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    const data = await studentService.update(_id as string, {
      name,
      co_mobile,
      mobile_no,
      code,
      country_id,
      division_id,
      district_id,
      dob,
      education,
      email,
      gender,
      image: imageUrl,
      nationality,
      nid_no,
      occupation,
      office_address,
      upazila_id,
      image_public_id: publicId,
      relationship,
      village,
      status,
    });

    const compareChange = detectChanges(
      findSingle.toObject(),
      data?.toObject(),
    );

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Student',
      entity_id: _id as string,
      changes: compareChange,
      description: `A new Student has been deleted Student_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  try {
    checkMongooseId(_id as string);

    const findSingle = await studentService.findOne({
      key: { _id: _id as string },
    });
    if (!findSingle) {
      return customError('Student not found', 404);
    }
    if (findSingle.image_public_id) {
      await cloudinary.uploader.destroy(findSingle?.image_public_id);
    }
    await studentService.deleteItem(_id as string);

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'Student',
      entity_id: _id as string,
      changes: findSingle,
      description: `A new Student has been deleted Student_id: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

const select = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await studentService
      .findAll({ status: 'ACTIVE' })
      .select('name code _id');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, findSingle, update, deleteItem, select };
