import { PaymentController } from "../controllers/PaymentController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { RequirePermission } from "../middlewares/Requirepermission.js";


export class PaymentRoutes{
    private controller: PaymentController;
    public router: Router;

    constructor(){
        this.controller = new PaymentController();
        this.router = Router();
        this.initializePaymentRoutes();
    }
    private initializePaymentRoutes (){
        this.router.post("/", requireAuth, RequirePermission(""), this.controller.receivepayment.bind(this.controller))
    }
}