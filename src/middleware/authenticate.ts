import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../api/v1/user/user.model';
import userService from '../api/v1/user/user.service';
import { RequestWithUser } from '../types/commonTypes';
import { customError } from '../utils/customError';
import { permission } from 'node:process';
export const authenticate = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer'))
      customError('No valid authentication token provide', 401);

    const token = authHeader?.substring(7);
    let decoded = jwt.verify(
      token as string,
      process.env.JTW_PASSWORD as string,
    ) as IUser;
    if (decoded) {
      const user = await userService.aggregate([
        {
          $match: { email: decoded.email },
        },
        {
          $lookup: {
            from: 'roles',
            localField: 'role_id',
            foreignField: '_id',
            as: 'roles',
          },
        },
        {
          $unwind: {
            path: '$roles',
            preserveNullAndEmptyArrays: true,
          },
        },

        // 🔥 only bring name + label from modules
        {
          $lookup: {
            from: 'modules',
            localField: 'roles.permissions.module_id',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: 1,
                  label: 1,
                },
              },
            ],
            as: 'modules',
          },
        },

        {
          $addFields: {
            permissions: {
              $map: {
                input: '$roles.permissions',
                as: 'perm',
                in: {
                  $mergeObjects: [
                    '$$perm',
                    {
                      $let: {
                        vars: {
                          matchedModule: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$modules',
                                  as: 'mod',
                                  cond: {
                                    $eq: ['$$mod._id', '$$perm.module_id'],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: {
                          name: '$$matchedModule.name',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },

        {
          $project: {
            roles: 0,
            modules: 0,
          },
        },
      ]);

      if (!user[0]) customError('No valid authentication token provide', 401);

      req.user = user[0];
      next();
    } else {
      customError('You are unauthorize', 401);
    }
  } catch (err) {
    customError('You are unauthorize', 401);
  }
};
