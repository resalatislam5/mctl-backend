import Counter from './counter.modal';

export const generateCode = async (name: 'enrollment', prefix: 'ENR') => {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  const number = String(counter.seq).padStart(4, '0');

  return `${prefix}-${number}`;
};
