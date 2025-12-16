import { Router } from "express";
import { AppProfileSettingController } from "../controllers/AppProfileSettingsController.js";
import multer from "multer";
import { requireAuth } from "../middlewares/requireAuth.js";

const uploaded = multer({ dest: "uploads/logos" });
export class AppProfileSettingsRoutes {
  public router: Router;
  private controller: AppProfileSettingController;

  constructor() {
    this.router = Router();
    this.controller = new AppProfileSettingController();
    this.initializeAppProfileSettingsRoutes();
  }

  private initializeAppProfileSettingsRoutes() {
    // this.router.post(
    //   "/save-settings",
    //   requireAuth,
    //   uploaded.single("logo"),
    //   this.controller..bind(this.controller)
    // );
    this.router.get(
      "/get-settings",
      requireAuth,
      this.controller.getSettings.bind(this.controller)
    );

    this.router.put(
      "/save-settings",
      requireAuth,
      uploaded.single("logo"),

      this.controller.saveSettings.bind(this.controller)
    );
  }
}
