import { z } from "zod";

export const appProfileSettingsSchema = z.object({
  name: z.string().min(5, "Name must be atleast 5 characters"),
  email: z.email(),
  website: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional().nullable(),
  parentCategory: z.string().optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional().nullable(),
  parentCategory: z.string().optional().nullable(),
});

export const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  notes: z.string().optional(),
  openingBalance: z.string().optional(),
});

const itemSchema = z.object({
  productId: z.number(),
  quantity: z.number(),
  costPrice: z.number(),
  total: z.number(),
});
const headerSchema = z.object({
  supplierId: z.number().optional().or(z.null()),
  receiptNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  status: z.enum(["draft", "completed", "cancelled"]).optional(),
  tax: z.number().optional(),
  discount: z.number().optional(),
  amountPaid: z.number().optional(),
  notes: z.string().optional(),
});
export const purchaseSchema = z.object({
  header: headerSchema,
  items: z.array(itemSchema).min(1),
});
export const customerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.number().optional(),
    creditLimitAllocated: z.boolean().default(false).optional(),
    openingBalance: z.number().optional()

});

const saleitemSchema = z.object({
  productId: z.number(),
  quantity: z.number(),
  price: z.number(),
  total: z.number(),
});

export const saleSchema = z.object({
  customerId: z.number().optional().or(z.null()),
  discount: z.number(),
  tax: z.number(),
  paymentMethod: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
  date: z.string().optional(),
  amountPaid: z.number(),
  saleItems: z.array(saleitemSchema).min(1, "Add at least one item"),
});
export const ReturnItemSchema = z.object({
  saleItemId: z.number().int().positive(),

  productId: z.number().int().positive(),

  quantitySold: z.number().int().positive(),

  quantityToReturn: z
    .number()
    .int()
    .positive()
    .refine((val) => val > 0, {
      message: "Quantity to return must be greater than zero",
    }),

  condition: z.enum(["RESALEABLE", "DAMAGED", "EXPIRED"]),
});

export const ReturnDtoSchema = z.object({
  saleId: z.number().int().positive(),

  items: z.array(ReturnItemSchema).min(1, "At least one item must be returned"),

  reason: z.string().min(3, "Reason must be at least 3 characters").max(255),

  refundMethod: z.enum(["CASH", "MOMO", "BANK", "STORE_CREDIT"]),

  note: z.string().max(1000).optional(),
});
