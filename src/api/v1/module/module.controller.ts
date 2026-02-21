import { NextFunction, Request, Response } from 'express';
import moduleService from './module.service';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await moduleService.findAll({ status: 'ACTIVE' });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export default { findAll };
