import { AppProfileSettings } from "../models/AppProfileSettings.js";
import { CRUDService } from "../core/CRUDService.js";

export class AppProfileSettingsRepository {
  private crudService: CRUDService<AppProfileSettings>;

  constructor() {
    this.crudService = new CRUDService(AppProfileSettings);
  }

  public saveSettings = async (
    data: Partial<AppProfileSettings>
  ): Promise<AppProfileSettings> => {
    return await this.crudService.create(data);
  };

  public getSettings = async (
    tenantId: string
  ): Promise<AppProfileSettings | null> => {
    return await AppProfileSettings.findOne({ where: { tenantId } });
  };

  public updateSettings = async (
    tenantId: string,
    data: Partial<AppProfileSettings>
  ):Promise<AppProfileSettings | null> => {
    const record = await AppProfileSettings.findOne({ where: { tenantId } });
    if (record) {
      await record.update(data);
    }else{
      return await this.crudService.create(data);

    }

    return record;
  };
}
