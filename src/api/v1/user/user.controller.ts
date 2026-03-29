import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { RequestWithUser } from '../../../types/commonTypes';
import { customError } from '../../../utils/customError';
import { detectChanges } from '../../../utils/detectChanges';
import { sendMail } from '../../../utils/sendMail';
import auditLogService from '../auditLog/auditLog.service';
import { ICreateUser } from './user.dto';
import userService from './user.service';

const findAll = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  const search = req.query.search?.toString() || '';
  const limit = Number(req.query.limit || 100);
  const skip = Number(req.query.skip || 0);
  const status = req.query.status?.toString() as 'ACTIVE' | 'INACTIVE';

  const query: any = {};

  // search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  try {
    const data = await userService.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'role_id',
          foreignField: '_id',
          as: 'role',
        },
      },
      {
        $addFields: {
          role_name: { $ifNull: [{ $arrayElemAt: ['$role.name', 0] }, null] },
        },
      },
      {
        $limit: limit,
      },
      {
        $skip: skip,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          data: [
            {
              $project: {
                _id: 1,
                name: 1,
                role_name: 1,
                email: 1,
                role_id: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ]);

    res.json({
      success: true,
      total: data[0]?.totalCount[0]?.count,
      data: data[0]?.data,
    });
  } catch (err) {
    next(err);
  }
};

const findOne = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;
  try {
    if (!_id || Array.isArray(_id) || !mongoose.Types.ObjectId.isValid(_id)) {
      return customError('Invalid id', 400);
    }

    const user = await userService.findOne({ _id });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role_id, status } = req.body as ICreateUser;

  const findUser = await userService.findOne({ email });
  if (findUser) customError('User already exit', 409);

  try {
    const data = await userService.create({
      name,
      email,
      role_id,
      password,
      status,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'CREATE',
      entity: 'User',
      entity_id: data._id.toString(),
      changes: { name: data.name, email: data.email },
      description: `A new user has been created user_id: ${data?._id}`,
    });

    await sendMail(
      email,
      'Welcome to MCTL',
      `
  <div style="background:#f1f3f4;padding:32px 16px;font-family:Roboto,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;">

      <!-- Subject bar -->
      <div style="background:#fff;border-radius:8px 8px 0 0;padding:20px 24px 16px;border-bottom:1px solid #e0e0e0;">
        <div style="font-size:22px;font-weight:400;color:#202124;">
          Welcome to MCTL — Your account is ready
          <span style="font-size:11px;font-weight:500;padding:2px 8px;border-radius:4px;background:#e8f0fe;color:#1a73e8;margin-left:10px;">Inbox</span>
        </div>
      </div>

      <!-- Email card -->
      <div style="background:#fff;border-radius:0 0 8px 8px;box-shadow:0 1px 3px rgba(0,0,0,0.12);">

        <!-- Body -->
        <div style="padding:24px 24px 32px;">

          <p style="font-size:15px;color:#202124;margin:0 0 20px;">Dear <strong>${name}</strong>,</p>

          <!-- Welcome banner -->
          <div style="background:#e8f0fe;border-radius:8px;padding:16px 20px;margin-bottom:24px;border-left:4px solid #1a73e8;">
            <div style="font-size:15px;font-weight:500;color:#1a73e8;margin-bottom:4px;">🎉 Your account has been successfully created.</div>
            <div style="font-size:14px;color:#3c4043;">Welcome to MCTL! You now have full access to your new account.</div>
          </div>

          <!-- Password box -->
          <div style="background:#f8f9fa;border:1px solid #e0e0e0;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
            <div style="font-size:11px;font-weight:500;color:#5f6368;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Your temporary password</div>
            <div style="font-size:20px;font-family:monospace;color:#202124;letter-spacing:2px;background:#fff;border:1px dashed #dadce0;border-radius:4px;padding:8px 12px;display:inline-block;">${password}</div>
            <div style="font-size:12px;color:#ea4335;margin-top:8px;">⚠ Please change this password after your first login.</div>
          </div>

          <p style="font-size:14px;color:#3c4043;line-height:1.6;margin:0 0 20px;">
            You can sign in to your MCTL account at any time. If you need help, contact our support team.
          </p>

          <!-- CTA -->
          <a href="https://mctl-mu.vercel.app/" style="display:inline-block;background:#1a73e8;color:#fff;font-size:14px;font-weight:500;padding:10px 24px;border-radius:4px;text-decoration:none;margin-bottom:24px;">Sign in to MCTL</a>

          <hr style="border:none;border-top:1px solid #e0e0e0;margin:20px 0;" />

          <div style="font-size:14px;color:#3c4043;line-height:1.7;">
            Best regards,<br/>
            <strong>MCTL Team</strong><br/>
            <span style="font-size:12px;color:#5f6368;">support@mctl.com</span>
          </div>

        </div>
      </div>

    </div>
  </div>
  `,
    );
    res
      .status(201)
      .json({ success: true, message: 'User Create Successfully' });
  } catch (err) {
    next(err);
  }
};

const update = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  const { name, email, password, role_id, status } = req.body as ICreateUser;

  try {
    if (!_id || Array.isArray(_id) || !mongoose.Types.ObjectId.isValid(_id)) {
      return customError('Invalid id', 400);
    }
    const findUser = await userService.findOne({ email });
    if (!findUser) customError('User Not Found', 404);
    let updateUser = {
      name,
      email,
      role_id,
      password,
      status,
    };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateUser.password = await bcrypt.hash(password, salt);
    }

    const data = await userService.update(_id, updateUser);

    const compareChange = detectChanges(findUser?.toObject(), {
      name: data?.name,
      email: data?.email,
      role_id: data?.role_id,
      status: data?.status,
    });

    await auditLogService.create({
      req,
      user: req.user,
      action: 'UPDATE',
      entity: 'User',
      entity_id: _id,
      changes: compareChange,
      description: `A new user has been updated user_id: ${data?._id}`,
    });

    if (password) {
      await sendMail(
        email,
        'Your MCTL Password Has Been Changed',
        `
  <div style="background:#f1f3f4;padding:32px 16px;font-family:Roboto,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;">

      <!-- Subject bar -->
      <div style="background:#fff;border-radius:8px 8px 0 0;padding:20px 24px 16px;border-bottom:1px solid #e0e0e0;">
        <div style="font-size:22px;font-weight:400;color:#202124;">
          Your password has been changed
          <span style="font-size:11px;font-weight:500;padding:2px 8px;border-radius:4px;background:#fce8e6;color:#c5221f;margin-left:10px;">Security</span>
        </div>
      </div>

      <!-- Email card -->
      <div style="background:#fff;border-radius:0 0 8px 8px;box-shadow:0 1px 3px rgba(0,0,0,0.12);">
        <div style="padding:24px 24px 32px;">

          <p style="font-size:15px;color:#202124;margin:0 0 20px;">Dear <strong>${name}</strong>,</p>

          <!-- Alert banner -->
          <div style="background:#fce8e6;border-radius:8px;padding:16px 20px;margin-bottom:24px;border-left:4px solid #c5221f;">
            <div style="font-size:15px;font-weight:500;color:#c5221f;margin-bottom:4px;">🔐 Admin has reset your password.</div>
            <div style="font-size:14px;color:#3c4043;">Your MCTL account password was changed by an administrator. Use the new credentials below to sign in.</div>
          </div>

          <!-- New password box -->
          <div style="background:#f8f9fa;border:1px solid #e0e0e0;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
            <div style="font-size:11px;font-weight:500;color:#5f6368;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Your new password</div>
            <div style="font-size:20px;font-family:monospace;color:#202124;letter-spacing:2px;background:#fff;border:1px dashed #dadce0;border-radius:4px;padding:8px 12px;display:inline-block;">${password}</div>
            <div style="font-size:12px;color:#ea4335;margin-top:8px;">⚠ Please sign in and update your password immediately.</div>
          </div>

          <!-- Didn't request this? -->
          <div style="background:#fff8e1;border-radius:8px;padding:14px 18px;margin-bottom:24px;border-left:4px solid #f9ab00;">
            <div style="font-size:13px;font-weight:500;color:#b06000;margin-bottom:2px;">Didn't expect this?</div>
            <div style="font-size:13px;color:#3c4043;">If you did not request this change, please contact your administrator immediately at <a href="mailto:support@mctl.com" style="color:#1a73e8;text-decoration:none;">support@mctl.com</a>.</div>
          </div>

          <!-- CTA -->
          <a href="https://mctl-mu.vercel.app/" style="display:inline-block;background:#1a73e8;color:#fff;font-size:14px;font-weight:500;padding:10px 24px;border-radius:4px;text-decoration:none;margin-bottom:24px;">Sign in to MCTL</a>

          <hr style="border:none;border-top:1px solid #e0e0e0;margin:20px 0;" />

          <div style="font-size:14px;color:#3c4043;line-height:1.7;">
            Best regards,<br/>
            <strong>MCTL Team</strong><br/>
            <span style="font-size:12px;color:#5f6368;">support@mctl.com</span>
          </div>

        </div>
      </div>

    </div>
  </div>
  `,
      );
    }
    res
      .status(200)
      .json({ success: true, message: 'User update Successfully' });
  } catch (err) {
    next(err);
  }
};
const deleteOne = async (req: Request, res: Response, next: NextFunction) => {
  const { _id } = req.params;

  try {
    if (!_id || Array.isArray(_id) || !mongoose.Types.ObjectId.isValid(_id)) {
      return customError('Invalid id', 400);
    }

    const findUser = await userService.findOne({ _id });
    if (!findUser) customError('User Not Found', 404);

    await userService.deleteOne(_id);

    await auditLogService.create({
      req,
      user: req.user,
      action: 'DELETE',
      entity: 'User',
      entity_id: _id,
      changes: findUser,
      description: `A new user has been deleted user_id: ${_id}`,
    });

    res.status(200).json({ success: true, message: 'Delete Successfully' });
  } catch (err) {
    next(err);
  }
};

const select = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  // const { name, email, limit, page } = req.query as userQuery;

  try {
    const users = await userService.findAll({}).select('name email _id');
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export default { findAll, create, deleteOne, findOne, update, select };
