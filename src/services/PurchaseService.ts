import purchaseRepo from "../repositories/PurchaseRepository.js";
import Product from "../models/Product.js";
import { Purchase } from "../models/Purchase.js";
import { PurchaseItem } from "../models/PurchaseItem.js";

class PurchaseService {
  public async create(payload: { header: Purchase | any; items: PurchaseItem[] }) {
    console.log("header: ", payload.header);
    const subtotal = payload.items?.reduce(
      (s: number, it: PurchaseItem) =>
        s + Number(it.total || it.quantity * it.costPrice),
      0
    );
    const tax = Number(payload.header.tax || 0);
    const discount = Number(payload.header.discount || 0);
    const total = subtotal! + tax - discount;
    const amountPaid = Number(payload.header.amountPaid || 0);
    const balance = total - amountPaid;
    payload.header = {
      ...payload.header,
      subtotal,
      tax,
      discount,
      total,
      amountPaid,
      balance,
    };

    const created = await purchaseRepo.create(payload);
    // if (payload.status === "completed") {
    //   for (const it of payload.items!) {
    //     const product = await Product.findByPk(it.productId);
    //     if (product) {
    //       await product.increment("inventory", { by: it.quantity });
    //     }
    //   }
    // }
    return created;
  }

  public async list(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {}
  ) {
    return await purchaseRepo.findAll(page, limit, search, baseWhere);
  }

  public async get(id: number) {
    return purchaseRepo.findById(id);
  }
  public async update(id: number, payload: any) {
    return purchaseRepo.update(id, payload);
  }
  public async remove(id: number) {
    return purchaseRepo.delete(id);
  }
}
export default new PurchaseService();
