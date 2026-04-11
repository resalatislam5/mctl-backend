import { NextFunction, Request, Response } from 'express';
import { IAuth } from './auth.dto';
import userService from '../user/user.service';
import { customError } from '../../../utils/customError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import auditLogService from '../auditLog/auditLog.service';
import moduleService from '../module/module.service';
import { Types } from 'mongoose';

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as IAuth;
  try {
    const user = await userService.findWithoutTenantId({ email });
    if (!user) customError('Wrong credential', 404);
    if (user?.status === 'INACTIVE')
      customError('Your account is deactivate', 403);

    const compare = await bcrypt.compare(password, user?.password as string);
    if (!compare) customError('Wrong credential', 404);
    const newUser = {
      email: user?.email,
      name: user?.name,
      role_id: user?.role_id,
    };
    const token = jwt.sign(newUser, process.env.JTW_PASSWORD as string, {
      // algorithm: 'RS256',
      expiresIn: '24h',
    });

    await auditLogService.create({
      req,
      user: user,
      action: 'LOGIN',
      entity: 'Enrollment',
      entity_id: user?._id as Types.ObjectId,
      description: `User login detected. User ID: ${user?._id?.toString()}`,
    });

    res.json({ success: true, data: { token: token, user: newUser } });
  } catch (err) {
    next(err);
  }
};

const check = async (req: Request, res: Response) => {
  const { _id, name, email, permissions, is_owner } = req.user;

  if (is_owner) {
    const module = await moduleService.findAll({
      status: 'ACTIVE',
      tenant_id: req.user?.tenant_id,
    });
    const permissions = module.map((m) => {
      return {
        name: m.name,
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
      };
    });

    const result = { _id, name, email, permissions: permissions };
    return res.status(200).json({ success: true, data: result });
  }
  const result = { _id, name, email, permissions };
  res.status(200).json({ success: true, data: result });
};
export default { login, check };
