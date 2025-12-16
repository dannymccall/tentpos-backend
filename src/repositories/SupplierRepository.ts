import Supplier from "../models/Supplier.js";
import { CRUDService } from "../core/CRUDService.js";
import { buildSearchQuery } from "../utils/helperFunctions.js";

export class SupplierRepostiory {
  private crudService: CRUDService<Supplier>;

  constructor() {
    this.crudService = new CRUDService(Supplier);
  }
  public async create(payload: Partial<Supplier>) {
    return await this.crudService.create(payload);
  }

  public async findById(id: number) {
    return await this.crudService.findById(id);
  }

  public async findAll(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {}
  ) {
    const searchCondition = buildSearchQuery(["name", "phone", "email", "address", "contactPerson"], search);

    if (!page || !limit) {
      return Supplier.findAll({ where: { ...baseWhere, ...searchCondition } });
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await Supplier.findAndCountAll({
      where: { ...baseWhere, ...searchCondition },
      //   include: [
      //     { model: ProductImage, as: "images" },
      //     { model: ProductVariant, as: "variants" },
      //     { model: Category, as: "categoryProduct" },
      //   ],
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
  }
  public update(id: number, payload: Partial<Supplier>) {
    return this.crudService.update(id, payload);
  }
  public async delete(id: number) {
    return this.crudService.delete(id);
  }

  public async bulkUpload(
      suppliers: Supplier[],
      tenantId: string,
    ) {
      // Attach tenantId and createdBy
      const records = suppliers.map((p) => ({
        ...p,
        tenantId,
      }));
  
      // Perform bulk insert (ignoring duplicates)
      return await Supplier.bulkCreate(records, { ignoreDuplicates: true });
    }
}
