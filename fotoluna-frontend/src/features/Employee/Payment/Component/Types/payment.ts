// types/payment.ts
export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type FilterType = 'all' | PaymentStatus;

export interface Installment {
  current: number;
  total: number;
}

export interface Payment {
  id: string;
  date: string;
  description: string;
  installment: Installment;
  installmentAmount: number;
  totalAmount: number;
  status: PaymentStatus;
  dueDate: string;
}