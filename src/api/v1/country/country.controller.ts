import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { customError } from '../../../utils/customError';
import countryService from './country.service';

const findAll = async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search?.toString() || '';

  try {
    const countryList = await countryService.findAll({ search });
    res.json(countryList);
    customError('Recourse not found', 400);
  } catch (err) {
    next(err);
  }
};

const findSingle = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (id !== 'string') throw new Error();
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error('Country id is required');
  try {
    const singleCountry = await countryService.findOne({ key: { _id: id } });
    res.json(singleCountry);
    customError('Recourse not found', 400);
  } catch (err) {
    next(err);
  }
};

const create = async (req: Request, res: Response) => {
  const { name, code } = req.body;
  try {
  } catch (err) {
    console.log(err);
  }
};

const update = async () => {};

export default { findAll, create, findSingle, update };
