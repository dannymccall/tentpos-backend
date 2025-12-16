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