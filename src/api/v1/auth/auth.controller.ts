import { NextFunction, Request, Response } from 'express';
import { IAuth } from './auth.dto';
import userService from '../user/user.service';
import { customError } from '../../../utils/customError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import auditLogService from '../auditLog/auditLog.service';

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as IAuth;
  try {
    const user = await userService.findOne({ email });
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
      entity_id: user?._id?.toString() as string,
      description: `User login detected. User ID: ${user?._id?.toString()}`,
    });

    res.json({ success: true, data: { token: token, user: newUser } });
  } catch (err) {
    next(err);
  }
};

const check = async (req: Request, res: Response) => {
  const { _id, name, email, permissions } = req.user;

  const result = { _id, name, email, permissions };
  res.status(200).json({ success: true, data: result });
};
export default { login, check };
