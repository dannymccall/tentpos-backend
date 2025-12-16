import { CRUDService } from "../core/CRUDService.js";
import { RoleDataScope } from "../models/RoleDataScope.js";

export class RoleDataScopeRepository {
  private crudService: CRUDService<RoleDataScope>;
  constructor() {
    this.crudService = new CRUDService(RoleDataScope);
  }

  public addRoleDataScope = async (
    data: Partial<RoleDataScope>
  ): Promise<RoleDataScope> => {
    const record = await RoleDataScope.findOne({where: {roleId: data.roleId}});
    if(record){
      return await record.update(data);
    }
    return await this.crudService.create(data);
  };

  public getRoleDataScope = async (
    roleId: number
  ): Promise<RoleDataScope | null> => {
    return await RoleDataScope.findOne({ where: { roleId } });
  };
}
