import StockAdjustment from "../models/StockAdjustment.js";
import { User } from "../models/User.js";
import { Branch } from "../models/Branch.js";
import Product from "../models/Product.js";
import { buildSearchQuery } from "../utils/helperFunctions.js";
import { IncludeOptions } from "sequelize";

 class StockAdjustmentRepository {
  public async getStockAdjustments(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {}
  ) {
    const searchCondition = buildSearchQuery(["saleNumber"], search);

    const where = {
      ...baseWhere,
      ...searchCondition,
    };

    const include: IncludeOptions[] = [
      {
        model: Product,
        as: "productStockAdjustment",
        attributes: ["id", "title"],
      },
      {
        model: Branch,
        as: "branchStockAdjustment",
        attributes: ["id", "name"],
      },
      {
        model: User,
        as: "userStockAdjustment",
        attributes: ["id", "fullName"],
      },
    ];
    if (!page && !limit) {
      return await StockAdjustment.findAll({
        where,
        include: include,
      });
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await StockAdjustment.findAndCountAll({
      where,
      include: include,
      limit,
      offset,
    });

    return {
      rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }
}
export default new StockAdjustmentRepository();