import { AppProfileSettingsRepository } from "../repositories/AppProfileSettingsRepository.js";
import { AppProfileSettings } from "../models/AppProfileSettings.js";

export class AppProfileSettingsService {
  private appProfileSettingsRepo: AppProfileSettingsRepository;

  constructor() {
    this.appProfileSettingsRepo = new AppProfileSettingsRepository();
  }

  public saveSettings = async (
    data: Partial<AppProfileSettings>
  ): Promise<AppProfileSettings> => {
    return await this.appProfileSettingsRepo.saveSettings(data);
  };

  public getSettings = async (
    tenantId: string
  ): Promise<AppProfileSettings | null> => {
    return await this.appProfileSettingsRepo.getSettings(tenantId);
  };

  public updateSettings = async (
    tenantId: string,
    data: Partial<AppProfileSettings>
  ): Promise<AppProfileSettings | null> => {
    return await this.appProfileSettingsRepo.updateSettings(tenantId, data);
  };
}
