import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import auditLogService from '../auditLog/auditLog.service';
import userService from '../user/user.service';
import { customError } from './../../../utils/customError';
import { IChangePassword } from './profile.dto';

const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { new_password, old_password } = req.body as IChangePassword;

  try {
    const { _id } = req.user;

    const findSingle = await userService.findOne({ _id: _id as string });

    if (!findSingle) {
      return customError('User not found', 404);
    }
    if (!old_password || !new_password) {
      return customError('Old password and new password are required', 400);
    }

    const isMatch = await bcrypt.compare(old_password, findSingle.password);
    if (!isMatch) {
      return customError('Old password is incorrect', 400);
    }

    findSingle.password = new_password;
    await findSingle.save();

    await auditLogService.create({
      req,
      user: req.user,
      action: 'UPDATE',
      entity: 'Password',
      entity_id: _id as string,
      description: `Password has been updated for user: ${_id}`,
    });

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

export default { changePassword };
