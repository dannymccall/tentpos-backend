import { Op, Sequelize } from "sequelize";
import { CRUDService } from "../core/CRUDService.js";
import { Branch } from "../models/Branch.js";
import { Role } from "../models/Role.js";
import { User } from "../models/User.js";
import { UserRole } from "../models/UserRoles.js";
import sequelize from "../config/database.js";
import { PaginatedResponse } from "../types.js";
import { buildSearchQuery } from "../utils/helperFunctions.js";
import { Sale } from "../models/Sale.js";
import { Customer } from "../models/Customer.js";
import { Invoice } from "../models/Invoice.js";
// import { AuditLog } from "../models/AuditLog.js";
export class UserRepository {
  private crudService: CRUDService<User>;

  constructor() {
    this.crudService = new CRUDService(User);
  }

  public getUsers = async (
    page: number = 1,
    limit: number = 10,
    baseWhere: any = {},
    search: string = "",
  ): Promise<PaginatedResponse<User> | User[]> => {
    const searchCondition = buildSearchQuery(
      ["fullName", "appRole", "branch.name"],
      search,
    );
    const where = { ...baseWhere, ...searchCondition };
    if (!page && !limit) {
      return this.crudService.findByConditions({ where });
    }
    const offset = (page - 1) * limit;
    const { rows, count } = await User.findAndCountAll({
      where: where,
      include: [
        {
          model: UserRole,
          as: "userRole",
          include: [{ model: Role, as: "role" }],
        },
        { model: Branch, as: "branch" },
      ],
      offset,
      limit,
      order: [["CreatedAt", "DESC"]],
    });
    return {
      rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  };

  public updateUser = async (
    id: number,
    data: Partial<User>,
  ): Promise<User | null> => {
    return await this.crudService.update(id, data);
  };

  public getUser = async (id: number): Promise<User | null> => {
    return await this.crudService.findById(id);
  };

  public getUserBusinessProfile = async (
    email: string,
    appRole: string,
    tenantId: string,
  ) => {
    return await User.findOne({
      where: { email, appRole, tenantId },
      attributes: ["id", "fullName", "email", "appRole"], // only vital fields
      include: [
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name"], // only vital branch fields
        },
        {
          model: UserRole,
          as: "userRole",
          include: [
            {
              model: Role,
              as: "role",
            },
          ],
        },
      ],
    });
  };

  public async getUserDetails(
    userId: number,
    tenantId: string,
    // dateFrom?: string,
    // dateTo?: string
  ) {
    const saleWhere: any = {
      userId,
      tenantId,
      status: "PAID",
    };

    // if (dateFrom && dateTo) {
    //   saleWhere.date = { [Op.between]: [dateFrom, dateTo] };
    // }

    const user = await User.findOne({
      where: { id: userId, tenantId },
      attributes: [
        "id",
        "fullName",
        "email",
        "branchId",
        "appRole",
        "createdAt",
      ],
      include: [
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name"],
        },
        {
          model: UserRole,
          as: "userRole",
          attributes: ["id"],
          include: [
            {
              model: Role,
              as: "role",
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    const salesSummary = await Sale.findOne({
      where: {
        userId,
        tenantId,
        status: "COMPLETED",
      },
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "totalTransactions"],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn("SUM", sequelize.col("total")),
            0,
          ),
          "totalSales",
        ],
        [
          sequelize.fn(
            "COALESCE",
            sequelize.fn("SUM", sequelize.col("discount")),
            0,
          ),
          "totalDiscount",
        ],
      ],
      raw: true,
    });

    const recentSales = await Sale.findAll({
      where: { userId, tenantId },
      include: [
        { model: Customer, as: "customer" },
        { model: Invoice, as: "invoice" },
      ],
      attributes: [
        "id",
        "saleNumber",
        "total",
        "paymentMethod",
        "status",
        "date",
        "createdAt",
        "subtotal",
        "amountPaid",
        "balance",
        "paymentStatus",
      ],
      order: [["createdAt", "DESC"]],
    });

    const monthlySales = await sequelize.query(
      `
  SELECT 
    DATE_FORMAT(s.createdAt, '%Y-%m') AS month,
    COUNT(s.id) AS totalTransactions,
    IFNULL(SUM(s.total), 0) AS totalSales,
    IFNULL(SUM(s.discount), 0) AS totalDiscount
  FROM sales s
  WHERE s.userId = :userId
    AND s.tenantId = :tenantId
    AND s.status = 'COMPLETED'
  GROUP BY DATE_FORMAT(s.createdAt, '%Y-%m')
  ORDER BY month ASC
  `,
      {
        replacements: {
          userId,
          tenantId,
        },
        type: (Sequelize as any).QueryTypes.SELECT,
      },
    );

    return {
      user,
      stats: {
        totalTransactions: Number(
          (salesSummary as any)?.totalTransactions ?? 0,
        ),
        totalSales: Number((salesSummary as any)?.totalSales ?? 0),
        totalDiscount: Number((salesSummary as any)?.totalDiscount ?? 0),
      },
      recentSales,
      monthlySales,
    };
  }
}
