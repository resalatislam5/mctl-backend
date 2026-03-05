import { Request } from 'express';
import AuditLog from './auditLog.modal';

export interface AuditParams {
  req: Request;
  user: any;
  action: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  description: string;
  entity_id: string;
  changes?: any;
}

const findAll = ({
  from_date,
  to_date,
}: {
  from_date?: string;
  to_date?: string;
}) => {
  const query: any = {};

  // Date filter
  if (from_date || to_date) {
    const dateFilter: any = {};

    if (from_date) {
      dateFilter.$gte = new Date(from_date);
    }

    if (to_date) {
      const toDate = new Date(to_date);
      toDate.setHours(23, 59, 59, 999); // include entire day
      dateFilter.$lte = toDate;
    }

    query.createdAt = dateFilter;
  }

  return AuditLog.find(query);
};

const create = async ({
  req,
  user,
  action,
  entity,
  entity_id,
  changes,
  description,
}: AuditParams): Promise<void> => {
  try {
    await AuditLog.create({
      user_id: user?._id,
      user_name: user?.name,
      action,
      entity,
      entity_id,
      description,
      changes: JSON.stringify(changes || {}),
      ip_address: req.ip || '',
      user_agent: req.headers['user-agent'] || '',
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

const count = ({
  from_date,
  to_date,
}: {
  from_date?: string;
  to_date?: string;
}) => {
  const query: any = {};

  // Date filter
  if (from_date || to_date) {
    const dateFilter: any = {};

    if (from_date) {
      dateFilter.$gte = new Date(from_date);
    }

    if (to_date) {
      const toDate = new Date(to_date);
      toDate.setHours(23, 59, 59, 999); // include entire day
      dateFilter.$lte = toDate;
    }
  }

  return AuditLog.countDocuments(query);
};

export default { create, findAll, count };
