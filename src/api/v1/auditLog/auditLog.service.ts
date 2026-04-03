import { Request } from 'express';
import { ClientSession } from 'mongoose';
import AuditLog from './auditLog.modal';
import { formatDateRange } from '../../../utils/DataFormat';

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
  user_id,
}: {
  from_date?: string;
  to_date?: string;
  user_id?: string;
}) => {
  const query: any = {};

  // Date filter
  if (from_date || to_date) {
    query.createdAt = formatDateRange(from_date, to_date);
  }
  if (user_id) {
    query.user_id = user_id;
  }

  return AuditLog.find(query);
};

const create = async (
  { req, user, action, entity, entity_id, changes, description }: AuditParams,
  session?: ClientSession | null,
) => {
  try {
    const data = new AuditLog({
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
    return data.save({ ...(session && { session }) });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
};

const count = ({
  from_date,
  to_date,
  user_id,
}: {
  from_date?: string;
  to_date?: string;
  user_id?: string;
}) => {
  const query: any = {};

  if (from_date || to_date) {
    query.createdAt = formatDateRange(from_date, to_date);
  }

  if (user_id) {
    query.user_id = user_id;
  }
  return AuditLog.countDocuments(query);
};

export default { create, findAll, count };
