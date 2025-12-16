import { LOCK, Op } from "sequelize";
import { Purchase } from "../models/Purchase.js";
import { PurchaseItem } from "../models/PurchaseItem.js";
import Supplier from "../models/Supplier.js";
import { buildSearchQuery } from "../utils/helperFunctions.js";

class PurchaseRepository {
  public async create(payload: { header: Purchase; items: PurchaseItem[] }) {
    const t = await Purchase.sequelize?.transaction();
    try {
      console.log(payload.header);
      const header = await Purchase.create(payload.header, { transaction: t });
      const items = payload.items?.map((it: PurchaseItem) => ({
        ...it,
        purchaseId: header.id,
      }));
      await PurchaseItem.bulkCreate(items as any, { transaction: t });
      await t?.commit();
      return header;
    } catch (error) {
      await t?.rollback();
      throw error;
    }
  }

  public async findById(id: number) {
    return await Purchase.findByPk(id, {
      include: [{ model: PurchaseItem, as: "items" }],
    });
  }

 public async findAll(
  page: number = 1,
  limit: number = 10,
  search: string = "",
  baseWhere: any = {}
) {
  // Build search ONLY for purchase fields
  const purchaseSearch = buildSearchQuery(
    ["receiptNumber", "status"],
    search
  );

  // Build supplier search separately
  // const supplierSearch = search
  //   ? {
  //       name: {
  //         [Op.like]: `%${search}%`,
  //       },
  //     }
  //   : {};

  const offset = (page - 1) * limit;

  const { rows, count } = await Purchase.findAndCountAll({
    where: {
      ...baseWhere,
      ...purchaseSearch,
    },
    include: [
      {
        model: PurchaseItem,
        as: "items",
        required: false,
      },
      {
        model: Supplier,
        as: "supplier",
        attributes: ["name"],
        // where: supplierSearch, // ← THIS IS THE FIX!!
      },
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

public async update(
  id: number,
  payload: { header: Purchase; items: PurchaseItem[] }
) {
  const t = await Purchase.sequelize?.transaction();
  try {
    const p = await Purchase.findByPk(id, {
      transaction: t,
      lock: t?.LOCK.UPDATE, // <-- FIXED
    });

    if (!p) {
      await t?.rollback();
      return null;
    }

    await p.update(payload.header, { transaction: t });

    if (payload.items) {
      await PurchaseItem.destroy({
        where: { purchaseId: id },
        transaction: t,
      });
    }

    const items = payload.items?.map((it) => ({
      ...it,
      purchaseId: id,
    }));

    await PurchaseItem.bulkCreate(items as any, { transaction: t });

    await t?.commit(); // <-- ADD THIS (you forgot it)
    return p;
  } catch (err) {
    await t?.rollback();
    throw err;
  }
}


  public async delete(id: number) {
    const t = await Purchase.sequelize?.transaction();
    try {
      await PurchaseItem.destroy({ where: { purchaseId: id }, transaction: t });
      await Purchase.destroy({ where: { id }, transaction: t });
      await t?.commit();
      return true;
    } catch (err) {
      console.log(err)
      await t?.rollback();
      throw err;
    }
  }
}
export default new PurchaseRepository();
