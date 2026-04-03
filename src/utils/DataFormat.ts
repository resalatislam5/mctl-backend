export const formatDateRange = (from_date?: string, to_date?: string) => {
  const dateFilter: Record<string, Date> = {};

  if (from_date) {
    const fromDate = new Date(from_date);
    fromDate.setHours(0, 0, 0, 0);
    dateFilter.$gte = fromDate;
  }

  if (to_date) {
    const toDate = new Date(to_date);
    toDate.setHours(23, 59, 59, 999);
    dateFilter.$lte = toDate;
  }

  return Object.keys(dateFilter).length ? dateFilter : null;
};
