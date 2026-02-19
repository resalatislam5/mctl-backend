import { Model } from 'mongoose';

interface paginationQuery {
  page?: number | string;
  limit?: number | string;
}

interface paginationResult<T> {
  success: boolean;
  data: T[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPage: number;
  };
}

export const paginate = async <T>(
  model: Model<T>,
  filter: Record<string, any> = {},
  query: paginationQuery,
  options: {
    sort?: Record<string, 1 | -1>;
    select?: string;
    populate?: any;
  },
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 100, 100);
  const skip = (page - 1) * 100;

  const [data, total] = await Promise.all([
    model
      .find(filter)
      .sort(options.sort || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(options.select || '')
      .populate(options?.populate || ''),
    model.countDocuments(filter),
  ]);
  return {
    success: true,
    data: data,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};
