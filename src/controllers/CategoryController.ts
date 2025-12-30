import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/CategoryService.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/sendSuccess.js";
import { createCategorySchema, updateCategorySchema } from "../utils/definitions.js";

export class CategoryController {
  private service: CategoryService;

  constructor() {
    this.service = new CategoryService();
  }

  /** -------------------------
   * Add Category
   --------------------------- */
  public addCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError("Invalid category details", 400));
      }

      const user = (req as any).user;
      if (!user) return next(new AppError("Unauthorized access", 401));

      const data = {
        ...parsed.data,
        tenantId: user.tenantId,
        createdBy: user.userId,
      };

      const category = await this.service.addCategory(data);
      return sendSuccess(res, "Category created successfully", category);
    } catch (err) {
      next(err);
    }
  };

  /** -------------------------
   * Get Categories
   --------------------------- */
  public getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page );
      const limit = Number(req.query.limit);
      const search = String(req.query.searchTerm || "");

      const user = (req as any).user;
      if (!user) return next(new AppError("Unauthorized", 401));

      const categories = await this.service.getCategories(
        page,
        limit,
        user.tenantId,
        search,
      );

      return sendSuccess(res, "Categories fetched successfully", categories);
    } catch (err) {
      next(err);
    }
  };

  /** -------------------------
   * Get Single Category
   --------------------------- */
  public getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      if (!id) return next(new AppError("Invalid category id", 400));

      const category = await this.service.getCategory(id);
      if (!category) return next(new AppError("Category does not exist", 404));

      return sendSuccess(res, "Category fetched successfully", category);
    } catch (err) {
      next(err);
    }
  };

  /** -------------------------
   * Update Category
   --------------------------- */
  public updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        return next(new AppError("Invalid category details", 400));
      }

      const id = Number(req.query.id);
      if (!id) return next(new AppError("Invalid category id", 400));

      const [updated] = await this.service.updateCategory(id, parsed.data);
      if (!updated) {
        return next(new AppError("Category does not exist", 404));
      }

      return sendSuccess(res, "Category updated successfully");
    } catch (err) {
      next(err);
    }
  };

  /** -------------------------
   * Delete Category
   --------------------------- */
  public deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.query.id);
      if (!id) return next(new AppError("Invalid category id", 400));

      const deleted = await this.service.deleteCategory(id);
      if (!deleted) return next(new AppError("Category does not exist", 404));

      return sendSuccess(res, "Category deleted successfully");
    } catch (err) {
      next(err);
    }
  };
  public bulkUploadCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = req.body;
      console.log(req.body)
      const {userId, tenantId} = (req as any).user
      if (!categories || !categories.length) return next(new AppError("categories not found", 400));

      const bulk = await this.service.bulkUpload(categories,userId, tenantId );

      return sendSuccess(res, "Categories added successfully", bulk, 201);
    } catch (err) {
      next(err);
    }
  };
}
