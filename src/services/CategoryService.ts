import { CategoryRepository } from "../repositories/CategoryRepository.js";
import { Category } from "../models/Category.js";
import { PaginatedResponse } from "../types.js";

export class CategoryService {
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
  }

  /** ---------------------------------
   * Create Category
   ----------------------------------- */
  public addCategory = async (
    data: Partial<Category>
  ): Promise<Category> => {
    return await this.categoryRepo.addCategory(data);
  };

  /** ---------------------------------
   * Get Categories (Paginated or All)
   ----------------------------------- */
  public getCategories = async (
    page: number = 1,
    limit: number = 10,
    tenantId: string,
    search: string = "",
    where: any = {}
  ): Promise<PaginatedResponse<Category> | Category[]> => {
    return await this.categoryRepo.getCategories(
      page,
      limit,
      tenantId,
      search,
      where
    );
  };

  /** ---------------------------------
   * Get Single Category
   ----------------------------------- */
  public getCategory = async (
    id: number
  ): Promise<Category | null> => {
    return await this.categoryRepo.getCategory(id);
  };

  /** ---------------------------------
   * Update Category
   ----------------------------------- */
  public updateCategory = async (
    id: number,
    data: Partial<Category>
  ): Promise<[affectedRows: number]> => {
    return await this.categoryRepo.updateCategory(id, data);
  };

  /** ---------------------------------
   * Delete Category
   ----------------------------------- */
  public deleteCategory = async (
    id: number
  ): Promise<boolean> => {
    return await this.categoryRepo.deleteCategory(id);
  };

  public bulkUpload = async (categories: Category[], staffId: number, tenantId:string) => {
    return await this.categoryRepo.bulkUpload(categories, tenantId, staffId)
  }
}
