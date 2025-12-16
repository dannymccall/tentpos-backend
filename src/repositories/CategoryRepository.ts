import { CRUDService } from "../core/CRUDService.js";
import { Category } from "../models/Category.js";
import { User } from "../models/User.js";
import { PaginatedResponse } from "../types.js";
import { buildSearchQuery } from "../utils/helperFunctions.js";

export class CategoryRepository {
  private crudService: CRUDService<Category>;

  constructor() {
    this.crudService = new CRUDService(Category);
  }

  /** -------------------------------
   * Create Category
   -------------------------------- */
  public addCategory = async (data: Partial<Category>): Promise<Category> => {
    return await this.crudService.create(data);
  };

  /** -------------------------------
   * Get All Categories (Paginated or Full)
   -------------------------------- */
  public getCategories = async (
    page: number = 1,
    limit: number = 10,
    tenantId: string,
    search: string = "",
   
  ): Promise<PaginatedResponse<Category> | Category[]> => {
    const searchCondition = buildSearchQuery(["name", "description"], search);

    const where = {
      tenantId,
      ...searchCondition,
    };

    // If no pagination, return all
    if (!limit && !page) {
      return await Category.findAll({
        where,
        // include: [{ model: Category, as: "parentCategory" }],
        order: [["createdAt", "DESC"]],
      });
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await Category.findAndCountAll({
      where,
      include: [
        // { model: User, as: "creator", attributes: ["fullName", "id"] },
        // { model: Category, as: "parentCategory" },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  };

  /** -------------------------------
   * Get Single Category
   -------------------------------- */
  public getCategory = async (id: number): Promise<Category | null> => {
    return await Category.findOne({
      where: { id },
      include: [
        { model: Category, as: "parentCategory" },
        { model: User, as: "creator", attributes: ["fullName", "id"] },
      ],
    });
  };

  /** -------------------------------
   * Update Category
   -------------------------------- */
  public updateCategory = async (
    id: number,
    data: Partial<Category>
  ): Promise<boolean | any> => {
    return await this.crudService.update(id, data);
  };

  /** -------------------------------
   * Delete Category
   -------------------------------- */
  public deleteCategory = async (id: number): Promise<boolean> => {
    return await this.crudService.delete(id);
  };

  public async bulkUpload(
    categories: Category[],
    tenantId: string,
    staffId: number
  ) {
    // Attach tenantId and createdBy
    const records = categories.map((c) => ({
      ...c,
      tenantId,
      createdBy: staffId,
    }));

    // Perform bulk insert (ignoring duplicates)
    return await Category.bulkCreate(records, { ignoreDuplicates: true });
  }
}
