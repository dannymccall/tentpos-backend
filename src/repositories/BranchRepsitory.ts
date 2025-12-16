import { CRUDService } from "../core/CRUDService.js";
import { Branch } from "../models/Branch.js";
import { User } from "../models/User.js";
import { PaginatedResponse } from "../types.js";
import { buildSearchQuery } from "../utils/helperFunctions.js";

export class BranchRepository {
  private crudService: CRUDService<Branch>;

  constructor() {
    this.crudService = new CRUDService(Branch);
  }

  public addBranch = async (
    data: Partial<Branch>
  ): Promise<Partial<Branch>> => {
    return await this.crudService.create(data);
  };

  public getBranches = async (
    page: number = 1,
    limit: number = 10,
    tenantId: string,
    search: string = ""
  ): Promise<PaginatedResponse<Branch> | Branch[]> => {
    if (!limit && !page) {
      return this.crudService.findAll();
    }

    const searchCondition = buildSearchQuery(["name","email"], search);

    const offset = (page - 1) * limit;
    const { rows, count } = await Branch.findAndCountAll({
      where: { tenantId, ...searchCondition },
      // include: {
      //   model: BranchManager,
      //   as: "manager",
      //   include: [{ model: User, as: "manager" }],
      // },
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
  };
  public getBranch = async (id: number): Promise<Branch | null> => {
    return await this.crudService.findById(id);
  };

  public updateRole = async (
    id: number,
    data: Partial<Branch>
  ): Promise<Partial<Branch> | null> => {
    return await this.crudService.update(id, data);
  };
}
