import { Sequelize } from "sequelize";
import { CRUDService } from "../core/CRUDService.js";
import { Branch } from "../models/Branch.js";
import { Role } from "../models/Role.js";
import { User } from "../models/User.js";
import { UserRole } from "../models/UserRoles.js";
import sequelize from "../config/database.js";
import { PaginatedResponse } from "../types.js";
import { buildSearchQuery } from "../utils/helperFunctions.js";
// import { AuditLog } from "../models/AuditLog.js";
export class UserRepository {
  private crudService: CRUDService<User>;

  constructor() {
    this.crudService = new CRUDService(User);
  }

  public getUsers = async (
    page: number = 1,
    limit: number = 10,
    tenantId: string,
    baseWhere: any = {},
    search: string = ""
  ): Promise<PaginatedResponse<User> | User[]> => {

    const searchCondition = buildSearchQuery(
      ["fullName", "appRole", "branch.name"],
      search
    );
    const where = {...baseWhere, ...searchCondition}
    if (!page && !limit) {
      return this.crudService.findByConditions({where});
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
    data: Partial<User>
  ): Promise<User | null> => {
    return await this.crudService.update(id, data);
  };

  public getUser = async (id: number): Promise<User | null> => {
    return await this.crudService.findById(id);
  };

  public getUserBusinessProfile = async (
    email: string,
    appRole: string,
    tenantId: string
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

  public getStaffDetails = async (staffId: number) => {
    // --- Staff general info ---
    const staffInfo = await User.findByPk(staffId, {
      attributes: [
        "id",
        "fullName",
        [
          // Number of clients registered
          Sequelize.literal(`(
          SELECT COUNT(*) 
          FROM clients 
          WHERE clients.staffId = User.id
        )`),
          "numberOfClientsRegistered",
        ],
        [
          // Number of clients registered
          Sequelize.literal(`(
          SELECT COUNT(*) 
          FROM loans 
          WHERE loans.userId = User.id AND status = 'CLOSED'
        )`),
          "numberOfClosedLoans",
        ],
        [
          // Number of clients registered
          Sequelize.literal(`(
          SELECT SUM(amount)
          FROM loans 
          WHERE userId = User.id AND status IN ('Disbursed', 'RESCHEDULED','CLOSED', 'WRITE-OFF','WAIVE')
        )`),
          "amountDisbursed",
        ],
        [
          // Role name
          Sequelize.literal(`(
          SELECT r.name
          FROM user_roles ur
          JOIN roles r ON ur.roleId = r.id
          WHERE ur.userId = User.id
          LIMIT 1
        )`),
          "role",
        ],
        [
          // Number of loans applied
          Sequelize.literal(`(
          SELECT COUNT(*)
          FROM loans
          WHERE loans.userId = User.id
        )`),
          "numberOfLoansApplied",
        ],
        [
          // Total recoveries collected
          Sequelize.literal(`(
          SELECT IFNULL(SUM(r.principalPaid + r.interestPaid), 0)
          FROM repayment_schedules r
          JOIN loans l ON r.loanId = l.id
          WHERE l.userId = User.id
            AND (r.status = 'PAID' OR r.status = 'PARTIALLY_PAID')
        )`),
          "recoveries",
        ],
      ],
      include: [
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name"],
        },
        // {
        //   model: AuditLog,
        //   as: "userLogs",
        //   attributes: ["id", "action", "entity", "entityId", "timestamp"],
        // },
      ],
    });

    if (!staffInfo) {
      throw new Error("Staff not found");
    }

    // --- Monthly loans vs recoveries for chart ---
    const monthlyData = await sequelize.query(
      `
  SELECT 
    DATE_FORMAT(l.createdAt, '%Y-%m') AS month,
    SUM(l.amount) AS totalDisbursed,                     -- total amount of loans disbursed
    IFNULL(SUM(r.principalPaid + r.interestPaid), 0) AS totalRecoveries  -- total repayments
  FROM loans l
  LEFT JOIN repayment_schedules r 
    ON r.loanId = l.id AND (r.status = 'PAID' OR r.status = 'PARTIALLY_PAID')  -- only count relevant repayments
  WHERE l.userId = :staffId
  GROUP BY DATE_FORMAT(l.createdAt, '%Y-%m')
  ORDER BY month ASC
  `,
      {
        replacements: { staffId },
        type: (Sequelize as any).QueryTypes.SELECT,
      }
    );

    // --- Return plain object ---
    return {
      ...staffInfo.get({ plain: true }),
      monthlyData,
    };
  };
}
