import { Op } from "sequelize";
import Payment from "../models/Payment.js";
import { Sale } from "../models/Sale.js";
import sequelize from "../config/database.js";
import Debtor from "../models/Debtos.js";

export default class PaymentService {
static async receivePayment(
  amount: number,
  customerId: number,
  method: "CASH" | "MOMO" | "BANK" | "CRYPTO",
  userId: number,
  tenantId: string,
  branchId: number
) {
  const transaction = await sequelize.transaction();

  try {
    let remaining = amount;

    const unpaidSales = await Sale.findAll({
      where: {
        customerId,
        balance: { [Op.gt]: 0 },
      },
      order: [["date", "ASC"]],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (unpaidSales.length === 0) {
      throw new Error("No unpaid sales found for this customer.");
    }
    console.log(unpaidSales);
    console.log({amount, remaining})
    for (const sale of unpaidSales) {
      if (remaining <= 0) break;

      const balance = Number(sale.balance);
      const pay = Math.min(balance, remaining);
      console.log({saleId: sale.id, balance, pay, remaining})
      await sale.update(
        {
          amountPaid: Number(sale.amountPaid) + pay,
          balance: balance - pay,
          paymentStatus: balance - pay === 0 ? "PAID" : "PARTIAL",
        },
        { transaction }
      );

      await Payment.create(
        {
          saleId: sale.id,
          amount: pay,
          method,
          tenantId,
          userId,
          branchId,
          description: `Debt payment for sale ${sale.saleNumber}`,
        },
        { transaction }
      );

      remaining -= pay;
    }

    const debtor = await Debtor.findOne({
      where: { customerId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (debtor) {
      const newTotal = Math.max(Number(debtor.totalOwed) - amount, 0);

      await debtor.update(
        {
          totalOwed: newTotal,
          status: newTotal === 0 ? "CLEARED" : "ACTIVE",
        },
        { transaction }
      );
    }

    await transaction.commit();
    return { status: "success", message: "Payment processed successfully." };
  } catch (error: any) {
    await transaction.rollback();
    console.log(error)
    return { status: "error", message: error.message };
  }
}

}
