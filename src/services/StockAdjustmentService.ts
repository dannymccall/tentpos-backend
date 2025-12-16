import { Transaction } from "sequelize";
import sequelize from "../config/database.js";
import { ProductBranch } from "../models/ProductBranch.js";
import StockAdjustment from "../models/StockAdjustment.js";
import stockAdjustmentRepo from "../repositories/StockAdjustmentRepository.js";

class StockAdjustmentService {
  async adjustStock(
    {
      productId,
      branchId,
      qtyChange,
      reason,
      note,
      userId,
      tenantId,
    }: {
      productId: number;
      branchId: number;
      qtyChange: number;
      reason:
        | "BROKEN"
        | "EXPIRED"
        | "LOST"
        | "FOUND"
        | "CORRECTION"
        | "RESTOCK";
      note?: string;
      userId: number;
      tenantId: string;
    },
    transaction?: Transaction
  ) {
    const run = async (t: Transaction) => {
      let productBranch = await ProductBranch.findOne({
        where: { productId, branchId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!productBranch) {
        if (qtyChange < 0) {
          throw new Error(
            "Cannot decrease stock for a product that has no inventory in this branch"
          );
        }

        productBranch = await ProductBranch.create(
          {
            productId,
            branchId,
            inventory: 0,
            tenantId,
          },
          { transaction: t }
        );
      }

      const newQty = Number(productBranch.inventory) + qtyChange;

      if (newQty < 0) {
        throw new Error("Stock cannot go below zero");
      }

      await StockAdjustment.create(
        {
          productId,
          branchId,
          qtyChange,
          reason,
          note,
          userId,
          tenantId,
        } as any,
        { transaction: t }
      );

      await productBranch.update({ inventory: newQty }, { transaction: t });

      return {
        status: "success",
        inventory: newQty,
      };
    };

    // 👇 Use parent transaction or create one
    if (transaction) {
      return run(transaction);
    }

    return sequelize.transaction(run);
  }

  public async getStockAdjustments(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {}
  ) {
    return stockAdjustmentRepo.getStockAdjustments(
      page,
      limit,
      search,
      baseWhere
    );
  }
}

export default new StockAdjustmentService();
