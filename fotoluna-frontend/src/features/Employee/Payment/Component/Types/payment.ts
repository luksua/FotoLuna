// components/Types/payment.ts

export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type FilterType = 'all' | PaymentStatus;

export interface PaymentInstallment {
  current: number;
  total: number;
}

export interface Payment {
  id: string;
  date: string;

  clientName: string;
  clientCedula: string | null;
  clientEmail: string | null;
  clientPhone: string | null;

  description: string;
  installment: PaymentInstallment;
  installmentAmount: number;
  totalAmount: number;
  status: PaymentStatus;
  dueDate: string | null;
}
