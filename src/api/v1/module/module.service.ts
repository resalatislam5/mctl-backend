import Module from './module.model';

const findAll = ({ status }: { status: string }) => {
  let query: any = {};
  if (status) {
    query.status = status;
  }
  return Module.find(query);
};

export default { findAll };
