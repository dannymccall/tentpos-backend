import ProductService from "../services/ProductService.js";
import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/sendSuccess.js";
import { AppError } from "../utils/AppError.js";

export class ProductController {
  private service: ProductService;

  constructor() {
    this.service = new ProductService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body, req.files);
      const { tenantId, branchId } = (req as any).user;
      // If you accept multipart/form-data, files are in req.files - handle upload
      const payload = { ...req.body };
      payload.images = req.files;
      // If your frontend sends JSON for variants/images you might need JSON.parse for certain fields
      if (typeof payload.variants === "string")
        payload.variants = JSON.parse(payload.variants);
      if (typeof payload.tags === "string")
        payload.tags = JSON.parse(payload.tags);
      if (typeof payload.images === "string")
        payload.images = JSON.parse(payload.images);

      const product = await this.service.createProduct({
        ...payload,
        tenantId,
        branchId,
      });
      return sendSuccess(res, "Product added successfully", product, 201);
    } catch (err: any) {
      console.error("Create product error:", err);
      next(err);
    }
  }

  public async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, branchId, appRole } = (req as any).user;
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const search = String(req.query.searchTerm || "");
      const products = await this.service.listProducts(
        page,
        limit,
        search,
        tenantId,
        appRole,
        branchId
      );
      return sendSuccess(res, "", products, 200);
    } catch (err: any) {
      console.error("List products error:", err);
      next(err);
    }
  }

  public async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.query.id);
      const { tenantId, branchId, appRole } = (req as any).user;

      const product = await this.service.getProduct(
        id,
        appRole,
        tenantId,
        branchId
      );
      console.log({ product });
      if (!product) return new AppError("Not Found");
      return sendSuccess(res, "", product, 200);
    } catch (err: any) {
      console.error("Get product error:", err);
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body, req.files);
      const { tenantId, branchId } = (req as any).user;
      const id = Number(req.query.id);

      // If you accept multipart/form-data, files are in req.files - handle upload
      const payload = { ...req.body };
      payload.images = req.files;
      // If your frontend sends JSON for variants/images you might need JSON.parse for certain fields
      if (typeof payload.variants === "string")
        payload.variants = JSON.parse(payload.variants);
      if (typeof payload.tags === "string")
        payload.tags = JSON.parse(payload.tags);
      if (typeof payload.images === "string")
        payload.images = JSON.parse(payload.images);

      const product = await this.service.updateProduct(id, payload);

      await this.service.updateBranchProduct(
        id,
        Number(req.body.inventory),
        branchId,
        tenantId
      );
      return sendSuccess(res, "Product updated successfully", product, 201);
    } catch (err: any) {
      console.error("Create product error:", err);
      next(err);
    }
  }

  public async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.query.id);
      await this.service.deleteProduct(id);
      return res.json({ success: true, message: "Deleted" });
    } catch (err: any) {
      console.error("Delete product error:", err);
      next(err);
    }
  }

  public bulkUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const products = req.body;
      console.log(req.body);
      const { tenantId } = (req as any).user;
      if (!products || !products.length)
        return next(new AppError("products not found", 400));

      const bulk = await this.service.bulkUpload(products, tenantId);

      return sendSuccess(res, "Products added successfully", bulk, 201);
    } catch (err) {
      next(err);
    }
  };

  public async fetchSaleProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { tenantId, branchId, appRole } = (req as any).user;
      const topLimit = req.query.topLimit
        ? Number(req.query.topLimit)
        : undefined;
      const search = String(req.query.search || "");
      const categoryId = req.query.categoryId;

      let products;
      if (appRole === "user" && branchId) {
        products = await this.service.fetchSaleProducts({
          tenantId,
          branchId,
          topLimit,
          search,
          categoryId: categoryId
            ? categoryId === "ALL"
              ? "ALL"
              : Number(categoryId)
            : "ALL",
        });
      } else {
        products = await this.service.fetchSaleProducts({
          tenantId,
          topLimit,
          search,
          categoryId: categoryId
            ? categoryId === "ALL"
              ? "ALL"
              : Number(categoryId)
            : "ALL",
        });
      }
      return sendSuccess(res, "", products, 200);
    } catch (err: any) {
      console.error("Fetch sale products error:", err);
      next(err);
    }
  }

  public async fetchLowStockProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { tenantId, branchId, appRole } = (req as any).user;
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const search = String(req.query.searchTerm || "");
      const products = await this.service.fetchLowStockProducts({
        tenantId,
        branchId,
        page,
        limit,
        search,
        appRole,
      });
      return sendSuccess(res, "", products, 200);
    } catch (err: any) {
      console.error("Fetch low stock products error:", err);
      next(err);
    }
  }

  public async getInventoryBreakdown(req: Request, res: Response, next: NextFunction){
    try{
      const id = Number(req.query.id);
      const breakdown = await this.service.getInventoryBreakdown(id);
      return sendSuccess(res, "", breakdown, 200)
    }catch(error){
      next(error)
    }
  }
}
