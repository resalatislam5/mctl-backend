export const detectChanges = (
  oldData: any,
  newData: any,
  ignoreFields: string[] = ['updatedAt', 'createdAt', '__v'],
) => {
  const changes: Record<string, any> = {};

  for (const key in newData) {
    // ignore some fields
    if (ignoreFields.includes(key)) continue;

    const oldVal = oldData[key]?.toString?.() ?? oldData[key];
    const newVal = newData[key]?.toString?.() ?? newData[key];

    if (oldVal !== newVal) {
      changes[key] = {
        old: oldData[key],
        new: newData[key],
      };
    }
  }

  return changes;
};
