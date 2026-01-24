import { Router } from "express";
import { TicketController } from "../controllers/TicketController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { roleDataScopeMiddleware } from "../middlewares/roleDataScopeMiddleware.js";
import multer from "multer";
import { requireActiveSubscription } from "../middlewares/requireActiveSubscription.js";

const uploaded = multer({ dest: "uploads/tickets-attachments" });

export class TicketRoutes {
  public router: Router;
  private controller: TicketController;

  constructor() {
    this.router = Router();
    this.controller = new TicketController();
    this.routes();
  }

  private routes() {
    this.router.post(
      "/create",
      requireAuth,
      uploaded.fields([{ name: "attachments", maxCount: 3 }]),

      this.controller.createTicket.bind(this.controller)
    );
    this.router.get(
      "/tickets",
      requireAuth,
      roleDataScopeMiddleware,
      this.controller.fetchTickets.bind(this.controller)
    );
    this.router.get(
      "/ticket",
      requireAuth,
      this.controller.fetchTicket.bind(this.controller)
    );
    this.router.put(
      "/ticket",
      requireAuth,
      this.controller.updateStatus.bind(this.controller)
    );
    this.router.post(
      "/message",
      requireAuth,
      this.controller.sendMessage.bind(this.controller)
    );
  }
}
