import { Role } from "../models/Role.js";
import { CRUDService } from "../core/CRUDService.js";
import { PaginatedResponse } from "../types.js";
import { buildSearchQuery } from "../utils/helperFunctions.js";
export class RoleRepository {
  private crudService: CRUDService<Role>;

  constructor() {
    this.crudService = new CRUDService(Role);0
  }
  public addNewRole = async (data: Partial<Role>): Promise<Partial<Role>> => {
    return await this.crudService.create(data);
  };

  public updateRole = async (id:number, data: Partial<Role>): Promise<Partial<Role> | null> => {
    return await this.crudService.update(id, data)
  }
  public getRoles = async (
    page: number = 1,
    limit: number = 10,
    tenantId:string,
    search: string = ""
  ): Promise<PaginatedResponse<Role> | Role[]> => {

    if(!limit && !page){
      return await this.crudService.findAll()
    }

        const searchCondition = buildSearchQuery(["name"], search);
    
    const offset = (page - 1) * limit;


    const { rows, count } = await Role.findAndCountAll({
      where: {tenantId, ...searchCondition},
      limit,
      offset,
      order: [["createdAt", "DESC"]], // optional: sort by newest first
    });

    return {
      rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  };

  public getRole = async (id: number): Promise<Role | null> => {
    return await this.crudService.findById(id);
  };
}
