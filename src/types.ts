export type PaginatedResponse<T> = {
  rows: T[];
  total: number;
  page: number;
  totalPages: number;
};

export type ReturnDto = {
  items: {
    condition:"RESALEABLE" | "DAMAGED" | "EXPIRED";
    productId: number;
    quantitySold: number;
    quantityToReturn: number;
    saleItemId: number
  }[];
  note?:string;
  reason: string;
  refundMethod: string;
  saleId: number
}

export interface GeneralReportFilters {
  startDate?: string;
  endDate?: string;
  branchId?: number;
  userId?: number;
  status?: string;
  tenantId: string;
}
export interface NormalizedSaleRow {
  id: number;
  saleNumber: string;
  date: string | null;
  status: string;
  paymentMethod: string | null;

  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;

  branch?:string;

  customer?: string;


  cashier?: string
    
  
}

export interface SalesReportResult {
  rows: NormalizedSaleRow[];
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    amountPaid: number;
    balance: number;
    count: number;
  };
}
export interface PaymentBreakdown {
  CASH: number;
  MOMO: number;
  BANK: number;
  OTHER: number;
}
export interface InventoryFilters {
  startDate?: string;
  endDate?: string;
  branchId?: number;
  productId?:number;
  status: string;
  categoryId: number;
  tenantId: string
}

export interface AccountingFilters {
  startDate?:string;
  endDate?: string;
  branchId?: number;
  tenantId?:string
}


export interface PurchasesReportFilters{
  startDate?:string;
  endDate?: string;
  tenantId: string
}
