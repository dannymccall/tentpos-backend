import { CRUDService } from "../core/CRUDService.js";
import { RolePermission } from "../models/Permissions.js";
import { PaginatedResponse } from "../types.js";

export class PermissionRepository {
  private crudService: CRUDService<RolePermission>;

  constructor() {
    this.crudService = new CRUDService(RolePermission);
  }

  public addNewPermission = async (
    data: Partial<RolePermission>
  ): Promise<Partial<RolePermission>> => {
    return await this.crudService.create(data);
  };


public getPermissions = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<RolePermission> | RolePermission[]> => {
  const offset = (page - 1) * limit;

  if(!limit && !page){
    return await this.crudService.findAll()
  }
  const { rows, count } = await RolePermission.findAndCountAll({
    limit,
    offset,
    order: [["createdAt", "DESC"]] // optional: sort by newest first
  });

  return {
    rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit)
  };
};

  public getPermission = async (id: number): Promise<RolePermission | null> => {
    return await this.crudService.findById(id);
  };
}
