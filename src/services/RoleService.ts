import { RoleRepository } from "../repositories/RoleRepository.js";
import { Role } from "../models/Role.js";
import { PaginatedResponse } from "../types.js";

export class RoleService {
  private roleRepo: RoleRepository;

  constructor() {
    this.roleRepo = new RoleRepository();
  }

  public addNewRole = async (data: Partial<Role>): Promise<Partial<Role>> => {
    return await this.roleRepo.addNewRole(data);
  };

  public getRoles = async (
    page: number = 1,
    limit: number = 10,
    tenantId:string,
    search = ""
  ): Promise<PaginatedResponse<Role> | Role[]> => {
    return await this.roleRepo.getRoles(page, limit,tenantId, search);
  };

  public getRole = async (id: number): Promise<Role | null> => {
    return await this.roleRepo.getRole(id);
  };

  public updateRole = async (
    id: number,
    data: Partial<Role>
  ): Promise<Partial<Role> | null> => {
    return await this.roleRepo.updateRole(id, data);
  };
}
