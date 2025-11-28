export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial' | 'no_info';
export type FilterType = 'all' | PaymentStatus;

export interface Installment {
  id: number | null;
  amount: number;
  due_date: string;
  paid: boolean;
  paid_at?: string | null;
  status: string;
  is_overdue?: boolean;
  receipt_path?: string | null;
}

export interface Payment {
  id: number;
  booking_id: number;
  appointment_id?: number;

  date: string;
  clientName: string;
  clientCedula: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  installment: {
    current: number;
    total: number;
  };
  installmentAmount: number;
  totalAmount: number;
  status: PaymentStatus;
  dueDate: string | null;

  installments?: Installment[];
}
