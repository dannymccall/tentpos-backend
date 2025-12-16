import { RoleDataScope } from "../models/RoleDataScope.js";
import { RoleDataScopeRepository } from "../repositories/RoleDataScopeRepository.js";

export class RoleDataScopeService {
  private roleDataScopeRepo: RoleDataScopeRepository;

  constructor() {
    this.roleDataScopeRepo = new RoleDataScopeRepository();
  }

  public addRoleDataScope = async (
    data: Partial<RoleDataScope>
  ): Promise<RoleDataScope> => {
    return await this.roleDataScopeRepo.addRoleDataScope(data);
  };

  public getRoleDataScope = async (
    roleId: number
  ): Promise<RoleDataScope | null> => {
    return await this.roleDataScopeRepo.getRoleDataScope(roleId);
  };
}
