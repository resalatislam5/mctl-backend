export type MoneyReceiptTypes = {
  payment_method: 'CASH' | 'BANK' | 'MOBILE_BANKING';
  student_id: object;
  total_amount: number;
  amount: number;
  acc_id: object;
};
