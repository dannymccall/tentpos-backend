import customerService from "../services/CustomerService.js";
import { Request, Response, NextFunction } from "express";
import { customerSchema } from "../utils/definitions.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/sendSuccess.js";
import { Customer } from "../models/Customer.js";

class CustomerController {
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, branchId } = (req as any).user;
      const parsed = customerSchema.safeParse(req.body);

      const exists = await Customer.findOne({where: {email: parsed.data?.email}});

      if(exists){
        return next(new AppError("Customer already exists"));
      }
      if (!parsed.success) {
        console.log(parsed.error.flatten());
        return next(new AppError("Invalid customer details"));
      }
      const customer = await customerService.createCustomer({
        ...parsed.data,
        tenantId,
        branchId,
      });
      return sendSuccess(res, "Customer created successfully", customer, 201);
    } catch (err) {
      next(err);
    }
  }

  public async list(req: Request, res: Response, next: NextFunction) {
    try {
      const baseWhere = {};
      const where = (req as any).applyDataScope("customers", baseWhere);
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const search = String(req.query.searchTerm || "");

      const customers = await customerService.getAllCustomers(
        page,
        limit,
        search,
        where
      );
      return sendSuccess(res, "", customers, 200);
    } catch (err) {
      next(err);
    }
  }

  public async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.query.id);
      const customer = await customerService.getCustomerById(id);
      return sendSuccess(res, "", customer, 200);
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = customerSchema.safeParse(req.body);
      const id = Number(req.query.id);
      if (!parsed.success) {
        console.log(parsed.error.flatten());
        return next(new AppError("Invalid customer details"));
      }
      const customer = await customerService.updateCustomer(id, parsed.data);
      return sendSuccess(res, "Customer updated successfully", customer, 201);
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.query.id);
      const deleted = await customerService.deleteCustomer(id);
      return sendSuccess(res, "Customer deleted successfully", deleted, 201)
    } catch (err) {
      next(err);
    }
  }

   public bulkUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customers = req.body;
      console.log(req.body)
      const {branchId, tenantId} = (req as any).user
      if (!customers || !customers.length) return next(new AppError("customers not found", 400));

      const bulk = await customerService.bulkUpload(customers,tenantId, branchId );

      return sendSuccess(res, "Customers added successfully", bulk, 201);
    } catch (err) {
      next(err);
    }
  };

  public async debtors(req: Request, res: Response, next: NextFunction) {
    try {
      const baseWhere = {};
      const where = (req as any).applyDataScope("debtors", baseWhere);
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const search = String(req.query.searchTerm || "");

      const customers = await customerService.fetchDebtors(
        page,
        limit,
        search,
        where
      );
      return sendSuccess(res, "", customers, 200);
    } catch (err) {
      next(err);
    }
  }
}

export default new CustomerController();
