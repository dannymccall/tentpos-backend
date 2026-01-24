import { Branch } from "../models/Branch.js";
import { Customer } from "../models/Customer.js";
import Payment from "../models/Payment.js";
import { Sale } from "../models/Sale.js";
import { User } from "../models/User.js";
import { buildSearchQuery } from "../utils/helperFunctions.js";

class PaymentRepository {
  public async getPayments(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {},
    customerId?: number,
  ) {
    const searchCondition = buildSearchQuery(["invoiceNumber"], search);
    const where = {
      ...baseWhere,
      ...searchCondition,
    };
    const offset = (page - 1) * limit;

    if (customerId && !isNaN(customerId)) {
      where.customerId = customerId;
    }
    const { rows, count } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Sale,
          as: "salePayment",
        },
        { model: Branch, as: "branchPayment" },
        { model: Customer, as: "customerPayment" },
        {model: User, as: "userPayment"}
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }
}

export default new PaymentRepository();
