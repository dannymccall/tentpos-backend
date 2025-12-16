import { RolePermission } from "../models/Permissions.js";
import { PermissionRepository } from "../repositories/PermissionRepository.js";
import { PaginatedResponse } from "../types.js";
export class PermissionService {
  private permissionRepo: PermissionRepository;

  constructor() {
    this.permissionRepo = new PermissionRepository();
  }

  public addNewPermission = async (
    data: Partial<RolePermission>
  ): Promise<Partial<RolePermission>> => {
    return await this.permissionRepo.addNewPermission(data);
  };

  public getPermissions = async (
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<RolePermission> | RolePermission[]> => {
    return await this.permissionRepo.getPermissions(page, limit);
  };

  public getPermission = async (id: number): Promise<RolePermission | null> => {
    return await this.permissionRepo.getPermission(id);
  };
}
